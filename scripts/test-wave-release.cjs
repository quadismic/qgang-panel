const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const actorId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';
let state;
function load(file, mocks = {}) {
  const loadedModule = { exports: {} };
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`, { filename: file })(
    name => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loadedModule, loadedModule.exports,
  );
  return loadedModule.exports;
}
const roles = load('src/lib/roles.ts');
const rich = load('src/lib/rich-text.ts');
const client = {
  auth: { async getUser() { return { data: { user: state.signedIn ? { id: actorId } : null } }; } },
  from(table) {
    let updating = false;
    return {
      select() {
        if (table === 'role_permissions') return Promise.resolve({ data: state.rows, error: null });
        return this;
      },
      eq() { return this; },
      update(changes) { updating = true; state.updates.push(changes); return this; },
      async maybeSingle() {
        if (updating) return state.updateError ? { data: null, error: { message: 'duplicate' } } : { data: { id: targetId }, error: null };
        return { data: state.profileReads++ === 0 ? { role: state.actorRole } : { id: targetId, role: state.targetRole }, error: null };
      },
    };
  },
  async rpc(name, args) { state.rpc.push({ name, args }); return { error: null }; },
  storage: { from(bucket) { return {
    async upload(path) { state.uploads.push({ bucket, path }); return { error: state.uploadError ? { message: 'denied' } : null }; },
    getPublicUrl(path) { return { data: { publicUrl: `https://test.invalid/${bucket}/${path}` } }; },
    async remove(paths) { state.removed.push({ bucket, paths }); return { error: null }; },
  }; } },
};
const mocks = {
  '@/lib/supabase/server': { createClient: async () => client, getCurrentUser: async () => state.signedIn ? { id: actorId } : null },
  '@/lib/access': { hasPermission: async () => state.permission },
  '@/lib/roles': roles,
  '@/lib/rich-text': rich,
};
const access = load('src/app/api/control/access/route.ts', mocks);
const profile = load('src/app/api/admin/profile/route.ts', mocks);
const ownProfile = load('src/app/api/profile/route.ts', mocks);
function reset(extra = {}) {
  state = { signedIn: true, permission: true, actorRole: 'founder', targetRole: 'member', profileReads: 0,
    rpc: [], updates: [], uploads: [], removed: [], rows: [{ role: 'member', permission: 'members.view', enabled: true }], ...extra };
}
function accessRequest(changes) { return new Request('https://test.invalid/api/control/access', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ changes }),
}); }
function profileRequest(extra = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ target_id: targetId, display_name: 'Test Üye', handle: 'test_member', bio: 'Merhaba', banner_motion: 'none', ...extra })) form.set(key, value);
  return new Request('https://test.invalid/api/admin/profile', { method: 'POST', body: form });
}
(async () => {
  reset({ signedIn: false }); assert.equal((await access.POST(accessRequest([]))).status, 401);
  reset({ permission: false }); assert.equal((await access.POST(accessRequest([]))).status, 403);
  const valid = { role: 'member', permission: 'members.view', enabled: true };
  for (const invalid of [
    { ...valid, role: 'founder' }, { ...valid, permission: 'maintenance.access' },
    { ...valid, role: 'admin', permission: 'access.manage' },
    { ...valid, permission: 'discipline.issue' },
    { ...valid, role: 'moderator', permission: 'discipline.review' }, { ...valid, enabled: 'true' },
  ]) {
    reset(); assert.equal((await access.POST(accessRequest([valid, invalid]))).status, 400);
    assert.equal(state.rpc.length, 0, 'Entire package must be validated before writing its first row');
  }
  reset(); const response = await access.POST(accessRequest([valid]));
  assert.equal(response.status, 200); assert.equal(state.rpc.length, 1);
  assert.deepEqual((await response.json()).rows, state.rows, 'Saved state must come back from the database');
  reset({ actorRole: 'moderator' }); assert.equal((await profile.POST(profileRequest())).status, 403);
  for (const targetRole of ['founder', 'admin']) {
    reset({ actorRole: 'admin', targetRole }); assert.equal((await profile.POST(profileRequest())).status, 403);
    assert.equal(state.updates.length, 0);
  }
  reset(); const saved = await profile.POST(profileRequest({ banner: new File(['image'], 'banner.webp', { type: 'image/webp' }) }));
  assert.equal(saved.status, 303); assert.match(saved.headers.get('location'), /saved=1$/);
  assert.equal(state.uploads[0].bucket, 'qgang-banners'); assert.ok(state.uploads[0].path.startsWith(actorId + '/'));
  assert.equal(state.updates[0].role, undefined, 'Public profile edit must not update authority fields');
  reset(); const invalidProfile = await profile.POST(profileRequest({ display_name: 'x'.repeat(51) }));
  assert.match(invalidProfile.headers.get('location'), /error=validation$/); assert.equal(state.updates.length, 0);
  reset({ updateError: true }); const failed = await profile.POST(profileRequest({ avatar: new File(['image'], 'avatar.webp', { type: 'image/webp' }) }));
  assert.match(failed.headers.get('location'), /error=save$/); assert.equal(state.removed.length, 1, 'Failed profile update must clean up the uploaded image');
  reset({ uploadError: true }); const uploadFailed = await profile.POST(profileRequest({ avatar: new File(['image'], 'avatar.webp', { type: 'image/webp' }) }));
  assert.match(uploadFailed.headers.get('location'), /error=image$/); assert.equal(state.updates.length, 0);
  for (const motion of ['none','zoom-in','zoom-out','pan-left','pan-right']) {
    reset(); const response = await ownProfile.POST(profileRequest({banner_motion:motion}));
    assert.match(response.headers.get('location'),/saved=1$/);
    assert.equal(state.updates[0].banner_motion,motion);
  }
  reset(); const badMotion = await ownProfile.POST(profileRequest({banner_motion:'invalid'}));
  assert.match(badMotion.headers.get('location'),/error=validation$/); assert.equal(state.updates.length,0);
  console.log('PASS: matrix authentication, founder/maintenance/discipline locks, whole-package validation, saved-state refresh; profile hierarchy, validation, storage RLS paths, error reporting and cleanup.');
})().catch(error => { console.error(error); process.exitCode = 1; });
