/**
 * Campsite API Types
 *
 * This file contains TypeScript type definitions for Campsite's public API.
 * Use these types to build type-safe integrations with Campsite.
 */

export type OrganizationRole = 'admin' | 'member' | 'viewer' | 'guest'

export interface AvatarUrls {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  xxl: string
}

export interface User {
  id: string
  dispay_name: string
  email: string
  avatar_urls: AvatarUrls
}

export interface OrganizationMember {
  id: string
  role: OrganizationRole
  created_at: string
  is_deactivated: boolean
  user: User
}

export interface Comment {
  id: string
  content: string
  created_at: string
  parent_id: string | null
}

export interface Channel {
  id: string
  name: string
}

export interface Post {
  id: string
  title: string
  created_at: string
  url: string
  content: string
  channel: Channel
}

export interface Message {
  id: string
  content: string
  created_at: string
  updated_at: string
  parent_id: string | null
}

export interface CreateCommentRequest {
  content_markdown: string
  parent_id?: string
}

export interface CreatePostRequest {
  title?: string
  content_markdown: string
  channel_id: string
}

export interface CreateMessageRequest {
  content_markdown: string
  parent_id?: string
}

export interface PaginatedResponse<T> {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: T[]
  total_count: number
}

export interface OrganizationMemberPage extends PaginatedResponse<OrganizationMember> {}

export interface PostPage extends PaginatedResponse<Post> {}
