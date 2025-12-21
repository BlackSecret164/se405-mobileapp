import { CommentWithReplies } from "@/types/comment";

// Mock comments organized by post ID (with nested replies for UI demo)
export const mockCommentsByPostId: Record<number, CommentWithReplies[]> = {
  // Comments for post 1 (joshua_l's Japan post)
  1: [
    {
      id: 101,
      user: {
        id: 102,
        username: "sarah_designs",
        display_name: "Sarah Mitchell",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      },
      content: "This looks amazing! 🔥",
      created_at: "2025-09-19T11:30:00Z",
      parent_comment_id: null,
      reply_count: 3,
      replies: [
        {
          id: 201,
          user: {
            id: 101,
            username: "joshua_l",
            display_name: "Joshua Lee",
            avatar_url: "https://i.pravatar.cc/150?img=1",
          },
          content: "Thank you so much! 🙏",
          created_at: "2025-09-19T11:35:00Z",
          parent_comment_id: 101,
          reply_count: 0,
        },
        {
          id: 202,
          user: {
            id: 105,
            username: "alex_photo",
            display_name: "Alex Turner",
            avatar_url: "https://i.pravatar.cc/150?img=12",
          },
          content: "I agree! The composition is perfect",
          created_at: "2025-09-19T12:00:00Z",
          parent_comment_id: 101,
          reply_count: 0,
        },
        {
          id: 203,
          user: {
            id: 106,
            username: "travel_jane",
            display_name: "Jane Smith",
            avatar_url: "https://i.pravatar.cc/150?img=20",
          },
          content: "Absolutely stunning! 😍",
          created_at: "2025-09-19T12:30:00Z",
          parent_comment_id: 101,
          reply_count: 0,
        },
      ],
    },
    {
      id: 102,
      user: {
        id: 103,
        username: "mike_adventures",
        display_name: "Mike Chen",
        avatar_url: "https://i.pravatar.cc/150?img=8",
      },
      content: "Japan is on my bucket list! How was the food?",
      created_at: "2025-09-19T12:15:00Z",
      parent_comment_id: null,
      reply_count: 8,
      replies: [
        {
          id: 204,
          user: {
            id: 101,
            username: "joshua_l",
            display_name: "Joshua Lee",
            avatar_url: "https://i.pravatar.cc/150?img=1",
          },
          content: "The food was incredible! You must try the ramen 🍜",
          created_at: "2025-09-19T12:20:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 205,
          user: {
            id: 107,
            username: "foodie_kim",
            display_name: "Kim Park",
            avatar_url: "https://i.pravatar.cc/150?img=25",
          },
          content: "Don't forget the sushi! Best I've ever had",
          created_at: "2025-09-19T13:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 206,
          user: {
            id: 108,
            username: "wanderlust_tom",
            display_name: "Tom Wilson",
            avatar_url: "https://i.pravatar.cc/150?img=30",
          },
          content: "I went last year, the street food is amazing!",
          created_at: "2025-09-19T14:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 207,
          user: {
            id: 109,
            username: "chef_maria",
            display_name: "Maria Garcia",
            avatar_url: "https://i.pravatar.cc/150?img=32",
          },
          content: "The wagyu beef is a must-try!",
          created_at: "2025-09-19T15:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 208,
          user: {
            id: 110,
            username: "david_eats",
            display_name: "David Brown",
            avatar_url: "https://i.pravatar.cc/150?img=35",
          },
          content: "Try the convenience store food too, surprisingly good!",
          created_at: "2025-09-19T16:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 209,
          user: {
            id: 111,
            username: "anna_adventures",
            display_name: "Anna Lee",
            avatar_url: "https://i.pravatar.cc/150?img=40",
          },
          content: "Matcha everything! 🍵",
          created_at: "2025-09-19T17:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 210,
          user: {
            id: 112,
            username: "travel_max",
            display_name: "Max Johnson",
            avatar_url: "https://i.pravatar.cc/150?img=45",
          },
          content: "The tempura is life-changing",
          created_at: "2025-09-19T18:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
        {
          id: 211,
          user: {
            id: 113,
            username: "sushi_lover",
            display_name: "Lisa Wang",
            avatar_url: "https://i.pravatar.cc/150?img=47",
          },
          content: "Tsukiji market is the place to be!",
          created_at: "2025-09-19T19:00:00Z",
          parent_comment_id: 102,
          reply_count: 0,
        },
      ],
    },
    {
      id: 103,
      user: {
        id: 104,
        username: "foodie_emma",
        display_name: "Emma Wilson",
        avatar_url: "https://i.pravatar.cc/150?img=9",
      },
      content:
        "The architecture in the background is beautiful! Where is this exactly?",
      created_at: "2025-09-19T14:00:00Z",
      parent_comment_id: null,
      reply_count: 2,
      replies: [
        {
          id: 212,
          user: {
            id: 101,
            username: "joshua_l",
            display_name: "Joshua Lee",
            avatar_url: "https://i.pravatar.cc/150?img=1",
          },
          content: "This is in Shibuya, Tokyo! Right near the famous crossing",
          created_at: "2025-09-19T14:10:00Z",
          parent_comment_id: 103,
          reply_count: 0,
        },
        {
          id: 213,
          user: {
            id: 104,
            username: "foodie_emma",
            display_name: "Emma Wilson",
            avatar_url: "https://i.pravatar.cc/150?img=9",
          },
          content: "Thanks! Adding it to my travel list! ✈️",
          created_at: "2025-09-19T14:15:00Z",
          parent_comment_id: 103,
          reply_count: 0,
        },
      ],
    },
    {
      id: 104,
      user: {
        id: 114,
        username: "craig_love",
        display_name: "Craig Love",
        avatar_url: "https://i.pravatar.cc/150?img=50",
      },
      content: "exactly..",
      created_at: "2025-12-13T10:00:00Z",
      parent_comment_id: null,
      reply_count: 0,
      replies: [],
    },
    {
      id: 105,
      user: {
        id: 114,
        username: "craig_love",
        display_name: "Craig Love",
        avatar_url: "https://i.pravatar.cc/150?img=50",
      },
      content: "exactly..",
      created_at: "2025-12-01T10:00:00Z",
      parent_comment_id: null,
      reply_count: 1,
      replies: [
        {
          id: 214,
          user: {
            id: 114,
            username: "craig_love",
            display_name: "Craig Love",
            avatar_url: "https://i.pravatar.cc/150?img=50",
          },
          content: "exactly..",
          created_at: "2025-12-13T10:00:00Z",
          parent_comment_id: 105,
          reply_count: 0,
        },
      ],
    },
    {
      id: 106,
      user: {
        id: 114,
        username: "craig_love",
        display_name: "Craig Love",
        avatar_url: "https://i.pravatar.cc/150?img=50",
      },
      content: "exactly..",
      created_at: "2025-12-13T10:00:00Z",
      parent_comment_id: null,
      reply_count: 0,
      replies: [],
    },
  ],

  // Comments for post 2 (sarah_designs's workspace post)
  2: [
    {
      id: 301,
      user: {
        id: 101,
        username: "joshua_l",
        display_name: "Joshua Lee",
        avatar_url: "https://i.pravatar.cc/150?img=1",
      },
      content: "Super clean setup! What monitor is that?",
      created_at: "2025-12-13T16:00:00Z",
      parent_comment_id: null,
      reply_count: 1,
      replies: [
        {
          id: 401,
          user: {
            id: 102,
            username: "sarah_designs",
            display_name: "Sarah Mitchell",
            avatar_url: "https://i.pravatar.cc/150?img=5",
          },
          content: "It's the LG 27UK850! Great for design work",
          created_at: "2025-12-13T16:15:00Z",
          parent_comment_id: 301,
          reply_count: 0,
        },
      ],
    },
    {
      id: 302,
      user: {
        id: 115,
        username: "design_pro",
        display_name: "Design Pro",
        avatar_url: "https://i.pravatar.cc/150?img=52",
      },
      content: "Goals! 🎯 Love the minimal aesthetic",
      created_at: "2025-12-13T17:00:00Z",
      parent_comment_id: null,
      reply_count: 0,
      replies: [],
    },
  ],

  // Comments for post 3 (mike_adventures's hiking post)
  3: [
    {
      id: 501,
      user: {
        id: 102,
        username: "sarah_designs",
        display_name: "Sarah Mitchell",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      },
      content: "Which trail is this? Looks breathtaking! 😍",
      created_at: "2025-12-12T09:00:00Z",
      parent_comment_id: null,
      reply_count: 2,
      replies: [
        {
          id: 601,
          user: {
            id: 103,
            username: "mike_adventures",
            display_name: "Mike Chen",
            avatar_url: "https://i.pravatar.cc/150?img=8",
          },
          content: "It's the Pacific Crest Trail section near Lake Tahoe!",
          created_at: "2025-12-12T09:30:00Z",
          parent_comment_id: 501,
          reply_count: 0,
        },
        {
          id: 602,
          user: {
            id: 102,
            username: "sarah_designs",
            display_name: "Sarah Mitchell",
            avatar_url: "https://i.pravatar.cc/150?img=5",
          },
          content: "Thanks! Definitely going to check it out 🥾",
          created_at: "2025-12-12T10:00:00Z",
          parent_comment_id: 501,
          reply_count: 0,
        },
      ],
    },
  ],

  // Default empty for other posts
  4: [],
  5: [],
};

// Helper function to get comments for a post
export function getCommentsForPost(postId: number): CommentWithReplies[] {
  return mockCommentsByPostId[postId] || [];
}

// Helper function to get more replies (simulates pagination)
export function getMoreReplies(
  _postId: number,
  _commentId: number,
  offset: number,
  limit: number = 5
): CommentWithReplies[] {
  const post = mockCommentsByPostId[_postId];
  if (!post) return [];

  const comment = post.find((c) => c.id === _commentId);
  if (!comment || !comment.replies) return [];

  return comment.replies.slice(offset, offset + limit);
}
