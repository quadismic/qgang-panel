export type Campfire = {
  id: string;
  slug: string;
  name: string;
  description: string;
  member_count?: number;
};

export type FeedPost = {
  id: string;
  author: string;
  handle: string;
  body: string;
  campfire?: string;
  created_at: string;
  reactions: number;
  comments: number;
};
