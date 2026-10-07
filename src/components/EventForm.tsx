import {EventActionForm} from "@/components/EventActionForm";
import {Button,Input,Select,Textarea} from "@/components/ui/Primitives";
import {eventInput} from "@/lib/events";
type EventDraft={id:string;title:string;description:string;type_id:string|null;legacy_type?:string|null;starts_at:string;ends_at:string;location:string;capacity:number|null;organizer_id:string|null};
export function EventForm({types,event,proposal=false,seed}:{types:{id:string;name:string}[];event?:EventDraft;proposal?:boolean;seed?:{id:string;title:string;description:string;type_id:string}}) {
 return <EventActionForm className="eventForm"><input type="hidden" name="action" value={proposal?"propose":"save"}/>{event&&<input type="hidden" name="id" value={event.id}/>}{seed&&<input type="hidden" name="proposal_id" value={seed.id}/>}{event?.organizer_id&&<input type="hidden" name="organizer_id" value={event.organizer_id}/>}
 <label>Başlık<Input name="title" required maxLength={180} defaultValue={event?.title??seed?.title}/></label>
 <label>Tür<Select name="type_id" defaultValue={event?.type_id??seed?.type_id??""}>{event?.legacy_type&&!event.type_id&&<option value="">Eski türü koru: {event.legacy_type}</option>}{types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
 <label className="eventFormWide">{proposal?"Önerinin ayrıntıları":"Açıklama"}<Textarea name="description" required={proposal} maxLength={10000} rows={4} defaultValue={event?.description??seed?.description}/></label>
 {!proposal&&<><label>Başlangıç · Türkiye saati<Input name="starts_at" type="datetime-local" required defaultValue={event?eventInput(event.starts_at):undefined}/></label><label>Bitiş · Türkiye saati<Input name="ends_at" type="datetime-local" required defaultValue={event?eventInput(event.ends_at):undefined}/></label><label>Yer / çevrimiçi buluşma bilgisi<Input name="location" maxLength={500} defaultValue={event?.location}/></label><label>Kapasite · boş bırakılırsa sınırsız<Input name="capacity" type="number" min={1} max={10000} defaultValue={event?.capacity??undefined}/></label></>}
 <Button level="primary" type="submit" className="eventFormWide">{proposal?"Öneriyi Gönder":event?"Etkinliği Kaydet":"Taslak Oluştur"}</Button></EventActionForm>;
}
