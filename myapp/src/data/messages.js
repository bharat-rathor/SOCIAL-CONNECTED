// ============================================================
// SOCIAL CONNECT — Starter & Demo Messages System
// ============================================================

export const DEMO_MESSAGES = [
  {
    id: "msg_001",
    senderId: 3,
    receiverId: 1,
    message: "Hey! Saw your profile. You're into music too? 🎸",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'seen',
    seen: true
  },
  {
    id: "msg_002",
    senderId: 1,
    receiverId: 3,
    message: "Yeah! Big time. What do you play?",
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    status: 'seen',
    seen: true
  },
  {
    id: "msg_003",
    senderId: 3,
    receiverId: 1,
    message: "Guitar mostly. You should check out my latest track sometime.",
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    status: 'seen',
    seen: true
  },
  {
    id: "msg_004",
    senderId: 1,
    receiverId: 3,
    message: "Sounds great! Would love that.",
    timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(),
    status: 'delivered',
    seen: false
  }
];

/**
 * Generate rich, realistic starter conversations for any user ID
 * @param {number|string} userId
 * @returns {Array} Array of message objects
 */
export const getStarterMessagesForUser = (userId) => {
  const uid = Number(userId);
  const now = Date.now();

  return [
    // Conversation 1: Priya Sharma (id: 2) - Unread new messages
    {
      id: `seed_2_1_${uid}`,
      senderId: 2,
      receiverId: uid,
      message: "Hey! Loved your profile picture 😊",
      timestamp: new Date(now - 1000 * 60 * 45).toISOString(), // 45m ago
      seen: false
    },
    {
      id: `seed_2_2_${uid}`,
      senderId: 2,
      receiverId: uid,
      message: "How has your day been going?",
      timestamp: new Date(now - 1000 * 60 * 15).toISOString(), // 15m ago
      seen: false
    },

    // Conversation 2: Amit Patel (id: 3) - Music & guitars
    {
      id: `seed_3_1_${uid}`,
      senderId: 3,
      receiverId: uid,
      message: "Hey! Saw your profile. You're into music too? 🎸",
      timestamp: new Date(now - 3600000 * 3).toISOString(),
      seen: true
    },
    {
      id: `seed_3_2_${uid}`,
      senderId: uid,
      receiverId: 3,
      message: "Yeah! Big time. What do you play?",
      timestamp: new Date(now - 3600000 * 2.8).toISOString(),
      seen: true
    },
    {
      id: `seed_3_3_${uid}`,
      senderId: 3,
      receiverId: uid,
      message: "Guitar mostly. Check out this view from yesterday!",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      timestamp: new Date(now - 3600000 * 2.5).toISOString(),
      seen: true
    },
    {
      id: `seed_3_4_${uid}`,
      senderId: uid,
      receiverId: 3,
      message: "That looks amazing brother!",
      timestamp: new Date(now - 3600000 * 2.2).toISOString(),
      seen: true
    },

    // Conversation 3: Neha Joshi (id: 4) - Doctor / cafe meetup
    {
      id: `seed_4_1_${uid}`,
      senderId: 4,
      receiverId: uid,
      message: "Hi! Are you living near Satellite or SG Highway?",
      timestamp: new Date(now - 3600000 * 5).toISOString(),
      seen: true
    },
    {
      id: `seed_4_2_${uid}`,
      senderId: uid,
      receiverId: 4,
      message: "Hey Neha! Yeah right around here. Close to the cafés.",
      timestamp: new Date(now - 3600000 * 4.5).toISOString(),
      seen: true
    },
    {
      id: `seed_4_3_${uid}`,
      senderId: 4,
      receiverId: uid,
      message: "Awesome! Know any good coffee spots for this weekend?",
      timestamp: new Date(now - 3600000 * 1.2).toISOString(),
      seen: false
    },

    // Conversation 4: Karan Shah (id: 5)
    {
      id: `seed_5_1_${uid}`,
      senderId: 5,
      receiverId: uid,
      message: "Hey! Love your vibe on here. Hope you are doing well!",
      timestamp: new Date(now - 3600000 * 8).toISOString(),
      seen: true
    },
    {
      id: `seed_5_2_${uid}`,
      senderId: uid,
      receiverId: 5,
      message: "Thanks Karan! Appreciate it. What brings you to Social Connect?",
      timestamp: new Date(now - 3600000 * 7).toISOString(),
      seen: true
    },
    {
      id: `seed_5_3_${uid}`,
      senderId: 5,
      receiverId: uid,
      message: "Just looking to meet cool people and explore the city 🔥",
      timestamp: new Date(now - 3600000 * 6).toISOString(),
      seen: true
    },

    // Conversation 5: Anjali Verma (id: 6) - Travel & Rohtang
    {
      id: `seed_6_1_${uid}`,
      senderId: 6,
      receiverId: uid,
      message: "Hi! I noticed we both love travel. Any upcoming trips planned?",
      timestamp: new Date(now - 3600000 * 12).toISOString(),
      seen: true
    },
    {
      id: `seed_6_2_${uid}`,
      senderId: uid,
      receiverId: 6,
      message: "Hey Anjali! Thinking about Manali or Himachal next month.",
      timestamp: new Date(now - 3600000 * 11.5).toISOString(),
      seen: true
    },
    {
      id: `seed_6_3_${uid}`,
      senderId: 6,
      receiverId: uid,
      message: "Oh wow, you will absolutely love it! The sunrises are breathtaking 🌄",
      timestamp: new Date(now - 3600000 * 11).toISOString(),
      seen: true
    },

    // Conversation 6: Dev Trivedi (id: 7) - Casual meet
    {
      id: `seed_7_1_${uid}`,
      senderId: 7,
      receiverId: uid,
      message: "Casual meet sometime?",
      timestamp: new Date(now - 3600000 * 24).toISOString(), // 1 day ago
      seen: true
    },
    {
      id: `seed_7_2_${uid}`,
      senderId: uid,
      receiverId: 7,
      message: "Sure, let me know when you're free this weekend.",
      timestamp: new Date(now - 3600000 * 23).toISOString(),
      seen: true
    },
    {
      id: `seed_7_3_${uid}`,
      senderId: 7,
      receiverId: uid,
      message: "Sounds good, Saturday afternoon works!",
      timestamp: new Date(now - 3600000 * 20).toISOString(),
      seen: true
    }
  ];
};
