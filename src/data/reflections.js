// === NEEDS TRANSLATOR REFLECTIONS ===
export const needsReflections = {
  'I feel ignored': {
    default: 'Feeling unseen can be deeply painful. It makes sense that a part of you is reaching for acknowledgment.',
    Reassurance: 'A need I might have is reassurance. Feeling ignored can stir old fears about worth. You are allowed to want to be seen.',
    'Being seen': 'A need I might have is to be seen. Invisibility can carry a deep hurt. Your presence matters, even when others miss it.',
    Connection: 'A need I might have is connection. Feeling ignored does not mean you are unimportant. It may mean the right connection is not yet present.',
    Understanding: 'A need I might have is understanding. You deserve to have someone listen and reflect back what they hear.',
    default_need: 'Feeling ignored can carry an old ache. You are allowed to want acknowledgment and presence.',
  },
  'I feel too much pressure': {
    Space: 'A need I might have is space. Wanting room to breathe does not mean I am doing something wrong.',
    Rest: 'A need I might have is rest. Pressure builds when the nervous system has no pause. Rest is not a reward; it is a need.',
    'Permission to say no': 'A need I might have is permission to say no. The pressure may be from holding too much. Saying no is a complete answer.',
    Choice: 'A need I might have is choice. When we feel pressure, we often feel trapped. Having even one small choice can help.',
    default_need: 'Feeling pressured is real. You are allowed to slow down and take up space at your own pace.',
  },
  'I feel afraid of closeness': {
    'Connection without pressure': 'A need I might have is connection without pressure. It makes sense to want closeness and still need to go slowly.',
    Safety: 'A need I might have is safety. Closeness can feel risky when it has been painful before. Going slowly is wise, not broken.',
    Space: 'A need I might have is space. Wanting closeness and needing distance at the same time is not contradiction. It is protection.',
    Clarity: 'A need I might have is clarity. It helps to know what feels safe before stepping closer. You can set that pace.',
    default_need: 'Fear of closeness often comes from having needed protection before. You are allowed to go at your own pace.',
  },
  'I feel ashamed': {
    Gentleness: 'A need I might have is gentleness. Shame often tells harsh stories. You are allowed a kinder voice.',
    Reassurance: 'A need I might have is reassurance. Shame can make things feel permanent and defining. They are not.',
    'Being seen': 'A need I might have is to be seen without judgment. You are allowed to be witnessed gently.',
    Support: 'A need I might have is support. Shame grows in isolation. You deserve at least one witness who responds with compassion.',
    default_need: 'Shame is one of the hardest feelings. You do not have to face it alone or all at once.',
  },
  'I feel trapped': {
    Choice: 'A need I might have is choice. Even small choices matter when things feel stuck.',
    Space: 'A need I might have is space. Feeling trapped can signal that something important needs more room.',
    'Permission to say no': 'A need I might have is permission to say no. A no is sometimes the door out of feeling trapped.',
    Clarity: 'A need I might have is clarity. Understanding why we feel trapped is the first step toward finding a way through.',
    default_need: 'Feeling trapped is real and hard. You are allowed to look for one small exit, one small breath of space.',
  },
  'I feel numb': {
    Safety: 'A need I might have is safety. Numbness may be a part of me trying to keep things manageable. I do not have to force myself to feel everything right now.',
    Rest: 'A need I might have is rest. Sometimes numbness is the nervous system saying it has had enough for now.',
    Gentleness: 'A need I might have is gentleness. Numbness can be a quiet request for something softer.',
    Time: 'A need I might have is time to think. There is no rush to feel or know everything at once.',
    default_need: 'Numbness is often a form of self-protection. You do not have to push through it to prove anything.',
  },
  'I feel overwhelmed': {
    Rest: 'A need I might have is rest. Overwhelm often means we have been carrying too much for too long.',
    Space: 'A need I might have is space. One thing at a time is enough. You do not have to hold it all right now.',
    Support: 'A need I might have is support. Overwhelm can ease when something or someone helps carry a piece.',
    Comfort: 'A need I might have is comfort. When everything is too loud, something small and soothing can help.',
    default_need: 'Feeling overwhelmed is a signal, not a failure. You are allowed to put some things down.',
  },
  'I feel lonely': {
    Connection: 'A need I might have is connection. Loneliness is one of the oldest human hurts. It deserves tenderness, not judgment.',
    'Connection without pressure': 'A need I might have is connection without pressure. Wanting to be less alone is not too much to want.',
    Comfort: 'A need I might have is comfort. Loneliness can ache deeply. You deserve warmth, even when it starts with small gestures.',
    'Being seen': 'A need I might have is to be seen. Feeling lonely often carries a wish to be noticed and known.',
    default_need: 'Loneliness is real. It does not mean something is wrong with you — it means you are human and need connection.',
  },
  'I feel disappointed': {
    Comfort: 'A need I might have is comfort. Disappointment can carry grief. You are allowed to feel that weight.',
    Reassurance: 'A need I might have is reassurance. Disappointment can make things feel hopeless. They do not have to stay that way.',
    Understanding: 'A need I might have is understanding. You deserved the thing you were hoping for.',
    Gentleness: 'A need I might have is gentleness. You are not wrong for having hoped.',
    default_need: 'Disappointment often means something mattered. That is not a flaw. That is you being human.',
  },
  'I do not know': {
    default: 'Not knowing is a completely valid place to be. You do not have to name things before you are ready.',
    Clarity: 'A need I might have is clarity. It is okay not to have words yet. Sitting with uncertainty is its own kind of courage.',
    Space: 'A need I might have is space. Sometimes we need quiet before we can hear ourselves.',
    'Time to think': 'A need I might have is time to think. There is no deadline on understanding yourself.',
    default_need: 'Not knowing is allowed. You can notice without having to explain or define anything right now.',
  },
};

export const getFeelingReflection = (feeling, need) => {
  const feelingData = needsReflections[feeling];
  if (!feelingData) {
    return `A need I might have is ${need}. You deserve to have this need honored, even if only gently and slowly.`;
  }
  if (feelingData[need]) return feelingData[need];
  if (feelingData.default_need) {
    return `A need I might have is ${need}. ${feelingData.default_need}`;
  }
  return `A need I might have is ${need}. You are allowed to hold this need with care and without judgment.`;
};

// === BOUNDARY SCRIPTS ===
export const boundaryScripts = {
  'I need more time': {
    Soft: [
      'I need a little time to think about that.',
      'I want to answer honestly, so I need some time to sit with this.',
      'I am not ready to decide right now. Can I come back to this?',
    ],
    Clear: [
      'I need more time before I respond.',
      'I cannot give you an answer right now.',
      'I will let you know when I am ready.',
    ],
    Warm: [
      'I care about this, which is why I want to take my time before I respond.',
      'I want to give this the thought it deserves. I need a little space first.',
      'Thank you for asking. I need a bit more time to figure out what feels true.',
    ],
    Firm: [
      'I am not going to answer this right now.',
      'I need time. I will follow up when I am ready.',
      'This is not something I can decide quickly.',
    ],
    'Very brief': [
      'I need more time.',
      'Not yet.',
      'I will get back to you.',
    ],
  },
  'I need space': {
    Soft: [
      'I care about this, and I need a little space before continuing.',
      'I am noticing I need some room to settle.',
      'I need to step back for now. That is not a message about you.',
    ],
    Clear: [
      'I need some space right now.',
      'I am stepping back for a while.',
      'I will reach out when I am ready.',
    ],
    Warm: [
      'I value this, and I need space so I can come back to it fully.',
      'I need a little room to breathe. I will come back when I feel more settled.',
      'Taking space does not mean I am pulling away. I just need to recharge.',
    ],
    Firm: [
      'I need space and I am taking it.',
      'I am not available right now.',
      'I need this boundary respected.',
    ],
    'Very brief': [
      'I need space.',
      'I need to step back.',
      'Give me some room.',
    ],
  },
  'I need to say no': {
    Soft: [
      'That does not work for me right now.',
      'I cannot say yes to that.',
      'I need to say no, even though it feels uncomfortable.',
    ],
    Clear: [
      'No.',
      'That is not something I can do.',
      'I am not going to be able to help with that.',
    ],
    Warm: [
      'I appreciate you asking, and I have to say no this time.',
      'I want to be honest — this is not something I can offer right now.',
      'This does not feel right for me. I need to say no.',
    ],
    Firm: [
      'No. That is my answer.',
      'I am not changing this decision.',
      'I have given you my answer.',
    ],
    'Very brief': [
      'No.',
      'Not this time.',
      'That does not work for me.',
    ],
  },
  'I need to pause a conversation': {
    Soft: [
      'I am noticing I am shutting down, so I need a pause.',
      'I want to continue this later when I feel more grounded.',
      'I need to pause before I can respond clearly.',
    ],
    Clear: [
      'I need to stop this conversation for now.',
      'I cannot continue right now. I need a break.',
      'Let us pause here and come back to this.',
    ],
    Warm: [
      'I want to continue this conversation, but I need to pause and breathe first.',
      'I care about getting this right, so I need a moment to settle.',
      'I am going to step away briefly. I want to come back when I can really be present.',
    ],
    Firm: [
      'I am pausing this conversation.',
      'We can return to this, but not right now.',
      'I need this to stop for now.',
    ],
    'Very brief': [
      'I need a pause.',
      'Let us stop here.',
      'I need a moment.',
    ],
  },
  'I need emotional safety': {
    Soft: [
      'I want to talk about this, but I need us to go slowly.',
      'I can stay present if we keep the tone gentle.',
      'I need this conversation to feel respectful.',
    ],
    Clear: [
      'I need this conversation to feel safe before I can continue.',
      'I need the tone to change before I can engage.',
      'I cannot participate if the conversation stays like this.',
    ],
    Warm: [
      'I value our connection, and I need us to take this slowly and gently.',
      'I want to be here with you. I need to feel emotionally safe to do that.',
      'I am willing to talk, but I need us to slow down and be gentle with each other.',
    ],
    Firm: [
      'I need this to be emotionally safe or I cannot continue.',
      'If the tone does not change, I will need to step away.',
      'Safety is a requirement, not a request.',
    ],
    'Very brief': [
      'I need gentleness here.',
      'This does not feel safe.',
      'I need safety first.',
    ],
  },
  'I need less pressure': {
    Soft: [
      'I am feeling overwhelmed by the pressure, and I need things to slow down.',
      'I need a little less urgency here. I am doing my best.',
      'Can we lower the pressure a little? I am struggling to breathe inside of it.',
    ],
    Clear: [
      'There is too much pressure here. I need it to ease.',
      'I cannot function well under this much pressure.',
      'I need you to back off a little.',
    ],
    Warm: [
      'I really want to show up well here, and the pressure is making that harder. Can we ease it together?',
      'I am asking for a softer approach. I respond better when there is less urgency.',
      'I care about this. I just need the pressure to come down so I can think clearly.',
    ],
    Firm: [
      'The pressure has to stop.',
      'I will not work well under this much pressure.',
      'I need this to change.',
    ],
    'Very brief': [
      'Less pressure, please.',
      'I need this to ease.',
      'Too much pressure.',
    ],
  },
  'I need to express a need': {
    Soft: [
      'I want to share something I need, and it feels a little vulnerable to say.',
      "Something has been feeling off, and I think it might be a need I haven't named yet.",
      'I am practicing saying this: I have a need, and I would like to share it.',
    ],
    Clear: [
      'I have a need I want to express.',
      'I want to name something that would help me.',
      'There is something I need, and I am going to say it.',
    ],
    Warm: [
      'I care about honesty between us, so I want to share something I need. I hope that is okay.',
      'Something in me is reaching for more, and I want to be honest about what that is.',
      'I have been thinking about what I need, and I want to share it with you.',
    ],
    Firm: [
      'I have a need. I am going to name it now.',
      'This is what I need: ...',
      'I need to say this clearly.',
    ],
    'Very brief': [
      'I have a need.',
      'I need to say something.',
      'I want to name a need.',
    ],
  },
  'I need to leave or step away': {
    Soft: [
      'I need to step away for now. I will come back when I feel ready.',
      'Something in me needs to go. That is not a message about this situation.',
      'I need to leave right now. I am not abandoning this — I just need air.',
    ],
    Clear: [
      'I need to leave now.',
      'I am stepping away.',
      'I am going to go.',
    ],
    Warm: [
      'I care about this, and right now the kindest thing I can do is step away for a bit.',
      'I am leaving to take care of myself. I will come back when I am steadier.',
      'I need to go and breathe. That is me being responsible, not absent.',
    ],
    Firm: [
      'I am leaving.',
      'I need to go and that is not up for discussion.',
      'I have to step away right now.',
    ],
    'Very brief': [
      'I need to go.',
      'I am stepping away.',
      'I need to leave.',
    ],
  },
  'I am not sure': {
    Soft: [
      'I am not fully sure what I need, but something does not feel right. Can we slow down?',
      'I am still figuring out what the boundary is, but I know something needs to shift.',
      'I do not have the words yet, but I need a pause while I find them.',
    ],
    Clear: [
      'I do not know exactly what I need, but I need something to change.',
      'I am not sure how to name this, but I need space to figure it out.',
      'Something is not working for me, even if I cannot say exactly what yet.',
    ],
    Warm: [
      'I am still learning how to name my needs. Right now, something feels off and I need time.',
      'I am working on finding the words. In the meantime, I need gentleness and patience.',
      'I am not sure yet, and that is okay. I just need a moment to listen inward.',
    ],
    Firm: [
      'Something needs to change here.',
      'I do not have the words yet, but I know I need this to be different.',
      'I need to pause until I can figure out what I need.',
    ],
    'Very brief': [
      'Something does not feel right.',
      'I need a pause.',
      'I am still figuring this out.',
    ],
  },
};

// === COGNITIVE REFRAMES ===
export const reframeThoughts = (originalThought, tone) => {
  const lcThought = originalThought.toLowerCase();

  const patterns = [
    {
      match: ['too needy', 'needy', 'need too much'],
      Compassionate: {
        rewrite: 'I have needs because I am human. The goal is not to have fewer needs; it is to learn how to honor them safely.',
        step: 'I can name one need without judging it.',
      },
      Grounded: {
        rewrite: 'Having needs is a fact of being human. The question is not whether I have them, but how I can meet them wisely.',
        step: 'I can write down one need I have been dismissing.',
      },
      'IFS-style': {
        rewrite: 'A part of me believes I am too needy. That part may have learned this from someone who could not meet my needs. My needs were never the problem.',
        step: 'I can speak gently to the part that believes I am too much.',
      },
      'Very gentle': {
        rewrite: 'I am allowed to have needs. That is simply what it means to be a person.',
        step: 'One need can be valid today.',
      },
      Encouraging: {
        rewrite: 'I am learning to honor my needs. That is growth, not weakness.',
        step: 'I can practice naming a need without apologizing for it.',
      },
      'Therapist-style': {
        rewrite: 'The belief that I am too needy often develops as a response to early experiences where needs went unmet or were unwelcome. My needs are real and deserve to be acknowledged.',
        step: 'I can practice saying "I have a need" without shrinking.',
      },
      'Brief and simple': {
        rewrite: 'Having needs is not a flaw. It is human.',
        step: 'One need is valid today.',
      },
    },
    {
      match: ['shut down', 'always shut down', 'i freeze'],
      Compassionate: {
        rewrite: 'A part of me shuts down when things feel too overwhelming. That response may have protected me before, and I can learn new options slowly.',
        step: 'I can pause, breathe, and notice what my body needs.',
      },
      Grounded: {
        rewrite: 'Shutting down is a nervous system response, not a character flaw. I can learn to work with it rather than shame it.',
        step: 'I can notice the first sign that I am shutting down and pause there.',
      },
      'IFS-style': {
        rewrite: 'A numbing part shuts things down to protect me from being overwhelmed. That part is trying to help, even when it feels isolating.',
        step: 'I can thank the numbing part and ask it to work with me, not for me.',
      },
      'Very gentle': {
        rewrite: 'It is okay that I sometimes go quiet inside. That is protection, not failure.',
        step: 'One breath is enough for right now.',
      },
      Encouraging: {
        rewrite: 'Shutting down is something I learned. I am learning new options, slowly and without pressure.',
        step: 'I can practice one small moment of staying present today.',
      },
      'Therapist-style': {
        rewrite: 'Dissociative responses, including emotional shutdown, are often adaptive responses to overwhelming experiences. This is a response I can work with over time with support.',
        step: 'I can notice what was present just before the shutdown happened.',
      },
      'Brief and simple': {
        rewrite: 'Shutting down was a way of surviving. I can learn new ways slowly.',
        step: 'One breath. One small step.',
      },
    },
    {
      match: ['something wrong with me', "something's wrong with me", 'broken', 'something is wrong'],
      Compassionate: {
        rewrite: 'Something happened to me, and parts of me adapted. I am not broken.',
        step: 'I can speak to myself with less blame today.',
      },
      Grounded: {
        rewrite: 'The ways I cope, protect myself, and struggle are responses to real experiences — not evidence of a fundamental flaw.',
        step: 'I can name one response I have as protective rather than broken.',
      },
      'IFS-style': {
        rewrite: 'A part of me carries the belief that something is fundamentally wrong with me. That part formed in a time when that belief may have felt like the only explanation. It is not the truth.',
        step: 'I can sit with the part that holds this belief and offer it some gentleness.',
      },
      'Very gentle': {
        rewrite: 'Nothing is fundamentally wrong with me. I adapted. That is different.',
        step: 'I do not have to believe something new today. I just do not have to repeat the harsh story.',
      },
      Encouraging: {
        rewrite: 'I am not broken. I am a person who has been through things and is still here, still trying.',
        step: 'I can name one thing I have survived.',
      },
      'Therapist-style': {
        rewrite: 'The belief that something is wrong with me is often an internalized message from experiences that were painful or shaming. It reflects what happened, not who I am.',
        step: 'I can gently challenge one part of this belief today.',
      },
      'Brief and simple': {
        rewrite: 'I am not broken. I adapted.',
        step: 'That is the simpler, truer story.',
      },
    },
    {
      match: ['rejected', 'rejection', 'will be rejected', 'being rejected'],
      Compassionate: {
        rewrite: 'A part of me learned that honesty could be risky. I can practice honesty in small, safe doses with people who have earned trust.',
        step: 'I can share one small truth instead of everything at once.',
      },
      Grounded: {
        rewrite: 'Fear of rejection often comes from real experiences of being rejected. That fear is understandable. It does not have to predict what will happen now.',
        step: 'I can notice when the fear of rejection is louder than the actual evidence in front of me.',
      },
      'IFS-style': {
        rewrite: 'A protective part anticipates rejection to prepare me for it. That part is trying to shield me from pain. I can thank it and remind it that I can tolerate some risk in safe relationships.',
        step: 'I can ask the part that fears rejection what it needs to feel safer.',
      },
      'Very gentle': {
        rewrite: 'Not every sharing will lead to rejection. I can test safety in small, gentle steps.',
        step: 'One small honest thing is enough today.',
      },
      Encouraging: {
        rewrite: 'I am learning that not everyone will reject me. I can find out slowly, with care.',
        step: 'I can choose one trustworthy person to be a little more honest with.',
      },
      'Therapist-style': {
        rewrite: 'Anticipatory rejection is a common protective response in people who have experienced relational pain. This belief is based in real experience and can shift with evidence of safe relationships.',
        step: 'I can track one instance where I was honest and was not rejected.',
      },
      'Brief and simple': {
        rewrite: 'Not everyone will reject me. I can find out slowly.',
        step: 'One small truth. One safe person.',
      },
    },
    {
      match: ['burden', 'too much', 'too much for'],
      Compassionate: {
        rewrite: 'I am not a burden for having needs and feelings. Believing I am is a wound, not a fact.',
        step: 'I can let one person support me without apologizing for needing it.',
      },
      Grounded: {
        rewrite: 'The idea that I am a burden is a belief, not a measurement. It may have come from being made to feel that way. That is different from being one.',
        step: 'I can notice the next time I apologize for a need that does not require an apology.',
      },
      'IFS-style': {
        rewrite: 'A part of me carries the fear of being a burden. That part may have needed to minimize itself to stay safe. I can tell it: you are not too much. You are enough.',
        step: 'I can speak to the part that learned to shrink.',
      },
      'Very gentle': {
        rewrite: 'I am allowed to take up space. That is not being a burden.',
        step: 'One small need today does not need an apology.',
      },
      Encouraging: {
        rewrite: 'I am learning that my presence and needs can be welcome. That is allowed to be true.',
        step: 'I can let something be received without minimizing it.',
      },
      'Therapist-style': {
        rewrite: 'The core belief "I am a burden" is often rooted in experiences where needs were unwelcome or punished. It is a learned belief about safety, not a truth about worth.',
        step: 'I can practice receiving support this week without immediately offsetting it.',
      },
      'Brief and simple': {
        rewrite: 'I am not a burden. I have needs.',
        step: 'Needs are not burdens.',
      },
    },
    {
      match: ['not enough', "not good enough", "never good enough", "never enough"],
      Compassionate: {
        rewrite: 'I am not "not enough." I am a person who learned to measure themselves by impossible standards. I can begin to release that.',
        step: 'I can name one thing I offered today without grading it.',
      },
      Grounded: {
        rewrite: 'Feeling like I am not enough is often a response to environments where I was asked to earn care. That was their limit, not my truth.',
        step: 'I can ask: "Enough by whose standard?"',
      },
      'IFS-style': {
        rewrite: 'A part of me holds the belief that I am not enough. That part formed in a real context. I can tell it: you were always enough. The environment was the problem.',
        step: 'I can offer the "not enough" part a different story today.',
      },
      'Very gentle': {
        rewrite: 'I do not have to be more than I am today.',
        step: 'One moment of being enough is enough.',
      },
      Encouraging: {
        rewrite: 'I am already enough in the ways that matter. I am learning to see that more clearly.',
        step: 'I can write one thing I did that was enough, even if small.',
      },
      'Therapist-style': {
        rewrite: '"I am not enough" is a core belief often installed through conditional love or chronic criticism. It describes an experience, not an identity.',
        step: 'I can begin to notice when I hold myself to an impossible standard.',
      },
      'Brief and simple': {
        rewrite: 'I am enough as I am, even while I am still growing.',
        step: 'This moment counts.',
      },
    },
  ];

  for (const pattern of patterns) {
    if (pattern.match.some((m) => lcThought.includes(m))) {
      const toneData = pattern[tone] || pattern['Compassionate'];
      return toneData;
    }
  }

  // Default generic reframe
  const defaults = {
    Compassionate: {
      rewrite: `A part of me believes: "${originalThought}" — and that part is trying to protect something important. I can listen to it gently without letting it be the only voice.`,
      step: 'I can hold this thought with curiosity instead of judgment today.',
    },
    Grounded: {
      rewrite: `The thought "${originalThought}" may be one interpretation of my experience. Other interpretations are also possible.`,
      step: 'I can look for one small piece of evidence that complicates this story.',
    },
    'IFS-style': {
      rewrite: `A part of me holds the belief: "${originalThought}". I can ask that part what it is protecting me from, and whether there is a gentler way to do that.`,
      step: 'I can ask the part that holds this belief: what are you trying to do for me?',
    },
    'Very gentle': {
      rewrite: `That thought has been with me for a while. I do not have to fight it or force it away. I can just notice it and offer it a little kindness.`,
      step: 'One breath. One moment of gentleness toward myself.',
    },
    Encouraging: {
      rewrite: `I have had this thought before, and I am still here. That is evidence of my resilience. I can begin writing a kinder story slowly.`,
      step: 'I can be on my own side, just for today.',
    },
    'Therapist-style': {
      rewrite: `The thought "${originalThought}" may reflect a learned belief formed in response to real experiences. Beliefs can shift with time, support, and new evidence.`,
      step: 'I can bring this thought into reflection with gentleness, not urgency.',
    },
    'Brief and simple': {
      rewrite: `That is one thought. It is not the whole story.`,
      step: 'I can write a different line today.',
    },
  };

  return defaults[tone] || defaults['Compassionate'];
};

// === EVIDENCE SHELF REFLECTIONS ===
export const evidenceReflections = {
  'I noticed a need': 'This counts. Noticing a need is a form of self-respect. You do not have to meet the need perfectly for the noticing to matter.',
  'I set a boundary': 'That is evidence of self-protection. A boundary does not make you unkind — it helps you stay connected to yourself.',
  'I rested': "Rest is not failure. Rest can be a way of telling your system: 'You do not have to earn care by pushing past your limits.'",
  'I paused before reacting': 'Pausing is a skill. It takes quiet courage to choose a breath over an automatic response.',
  'I survived something hard': 'Survival is not small. You stayed. That is worth acknowledging.',
  'I let myself want something': 'Wanting things is allowed. You are allowed to want, even when wanting has felt unsafe before.',
  'I did not abandon myself': 'That is a meaningful repair. Even one moment of staying with yourself can become a new kind of evidence.',
  'I asked for clarity': 'Asking for clarity is a sign of self-respect. You deserve to understand what is happening around you.',
  'I left an overwhelming situation': 'Choosing to leave is a form of protection. You knew what you needed and you acted on it.',
  'I was honest with myself': 'Honesty with yourself is one of the most generous things you can practice. This counts.',
  'I tried again': 'You tried again. After everything, you tried again. That is evidence of something steady in you.',
  'I let something be imperfect': 'Allowing imperfection is a form of self-compassion. That is significant work.',
  'I reached out': 'Reaching out takes courage, especially when asking feels risky. You did it.',
  'I protected my peace': 'Protecting your peace is not selfish. It is an act of care for your whole system.',
};

// === CHARACTER NOTES / IFS PARTS ===
export const partsNotes = {
  'Scared Child': {
    'Rejection': {
      trying: 'This part may be trying to protect you from the pain of being rejected or turned away.',
      appreciation: 'Thank you, Scared Child, for trying to keep me safe from hurt.',
      selfLed: 'I hear you. You do not have to be alone in this fear. I am here with you now.',
    },
    'Shame': {
      trying: 'This part may be trying to protect you from feeling the deep pain of shame again.',
      appreciation: 'Thank you for trying to protect me from that kind of hurt.',
      selfLed: 'I see you. You do not have to carry shame alone. You were not the problem.',
    },
    'Being ignored': {
      trying: 'This part may be trying to prepare for or prevent the pain of being invisible or dismissed.',
      appreciation: 'Thank you for trying to protect me from feeling unseen.',
      selfLed: 'I see you. I am not ignoring you. You matter here.',
    },
    default: {
      trying: 'This part may be trying to protect you from something that once felt very unsafe.',
      appreciation: 'Thank you, Scared Child, for staying alert on my behalf.',
      selfLed: 'You are safe right now. I am with you, and we can go slowly.',
    },
  },
  'Shamed Child': {
    'Rejection': {
      trying: 'This part may be trying to prepare for rejection by hiding the parts it believes are unacceptable.',
      appreciation: 'Thank you for trying to protect me from the worst of the shame spiral.',
      selfLed: 'You did not deserve the shame you were given. I see that now.',
    },
    'Shame': {
      trying: 'This part may be holding old messages about not being good enough — trying to manage the pain by taking the blame.',
      appreciation: 'Thank you for carrying something that was never yours to carry.',
      selfLed: 'I want you to know: you are not what shame says you are.',
    },
    default: {
      trying: 'This part may be holding old shame messages and trying to manage them by staying small or hidden.',
      appreciation: 'Thank you, Shamed Child, for surviving something very hard.',
      selfLed: 'You deserved gentleness. I can offer that to you now.',
    },
  },
  'Lonely Child': {
    'Feeling alone': {
      trying: 'This part may be aching from unmet needs for closeness and trying to find a way to be seen or held.',
      appreciation: 'Thank you, Lonely Child, for still wanting connection even when it has been painful.',
      selfLed: 'You are not alone right now. I am here with you.',
    },
    default: {
      trying: 'This part may be carrying deep loneliness and reaching for connection or comfort.',
      appreciation: 'Thank you for not giving up on the need for belonging.',
      selfLed: 'Your loneliness makes sense. I am here, and we can find connection slowly.',
    },
  },
  'Inner Critic': {
    'Shame': {
      trying: 'This part may be trying to prevent rejection by catching mistakes before others do.',
      appreciation: 'Thank you for trying to protect me from being hurt or judged.',
      selfLed: 'I hear your concern. We can use gentleness instead of attack.',
    },
    'Rejection': {
      trying: 'This part may believe that if it criticizes first, others will not have the chance to reject you.',
      appreciation: 'Thank you, Inner Critic, for trying to keep me safe from rejection.',
      selfLed: 'I see that you are trying to protect me. We can try a gentler way.',
    },
    'Failure': {
      trying: 'This part may be trying to push you toward success to avoid the pain of failure or humiliation.',
      appreciation: 'Thank you for believing in what I am capable of, even if the voice has been harsh.',
      selfLed: 'I want to succeed too. But I need encouragement, not harshness, to get there.',
    },
    default: {
      trying: 'This part may be trying to prevent criticism, rejection, or failure by criticizing from the inside first.',
      appreciation: 'Thank you, Inner Critic, for trying to keep me safe — even when the method is hard.',
      selfLed: 'I hear your concern. We can use gentleness instead of attack.',
    },
  },
  'Numbing Part': {
    'Being overwhelmed': {
      trying: 'This part may be trying to keep you from feeling too much all at once.',
      appreciation: 'Thank you, Numbing Part, for trying to keep things manageable.',
      selfLed: 'You do not have to disappear. I just want to help you not work so hard.',
    },
    'Vulnerability': {
      trying: 'This part may be trying to protect you from the risk of feeling and being hurt.',
      appreciation: 'Thank you for trying to keep the pain from becoming overwhelming.',
      selfLed: 'We can feel things slowly, a little at a time. You do not have to shut everything down.',
    },
    default: {
      trying: 'This part may be trying to manage pain or overwhelm by turning down the emotional volume.',
      appreciation: 'Thank you, Numbing Part, for carrying so much on my behalf.',
      selfLed: 'You do not have to disappear completely. I can help carry some of this.',
    },
  },
  'Distractor': {
    'Feeling alone': {
      trying: 'This part may be trying to fill the silence or loneliness with activity and stimulation.',
      appreciation: 'Thank you for trying to keep me company when being still felt too empty.',
      selfLed: 'I can be with you in the quiet. We do not always have to fill it.',
    },
    'Being overwhelmed': {
      trying: 'This part may be trying to pull attention away from what feels too big or painful.',
      appreciation: 'Thank you, Distractor, for giving me breaks from things that feel overwhelming.',
      selfLed: 'I see what you are doing for me. We can also learn to sit with hard things a little at a time.',
    },
    default: {
      trying: 'This part may be trying to help you avoid pain, overwhelm, or difficult feelings through distraction.',
      appreciation: 'Thank you for trying to give me relief when things feel too heavy.',
      selfLed: 'I see what you are protecting me from. We can find ways to rest that are also restorative.',
    },
  },
  'Perfectionist': {
    'Failure': {
      trying: 'This part may be trying to prevent failure, humiliation, or the pain of not being good enough.',
      appreciation: 'Thank you, Perfectionist, for caring so much about doing things well.',
      selfLed: 'I can do my best without demanding perfection. We can both be easier on ourselves.',
    },
    'Rejection': {
      trying: 'This part may believe that perfection will prevent others from finding fault and rejecting you.',
      appreciation: 'Thank you for working so hard to protect me from criticism.',
      selfLed: 'I do not need to be perfect to be accepted. We can begin releasing that burden.',
    },
    default: {
      trying: 'This part may be trying to prevent shame, rejection, or failure through flawless performance.',
      appreciation: 'Thank you, Perfectionist, for believing I am capable of more.',
      selfLed: 'I am enough even when things are imperfect. We can practice that together.',
    },
  },
  'Avoidant Part': {
    'Vulnerability': {
      trying: 'This part may be trying to prevent the pain of being too exposed or disappointed.',
      appreciation: 'Thank you for trying to keep me safe when closeness feels risky.',
      selfLed: 'We can go slowly. We do not have to choose between closeness and safety.',
    },
    'Rejection': {
      trying: 'This part may be staying distant to prevent the ache of being turned away.',
      appreciation: 'Thank you, Avoidant Part, for trying to protect me from rejection.',
      selfLed: 'I want to move toward connection at a pace that feels safe. We can try that together.',
    },
    default: {
      trying: 'This part may be trying to protect you from the pain of closeness, disappointment, or vulnerability.',
      appreciation: 'Thank you, Avoidant Part, for keeping a protective distance when it felt necessary.',
      selfLed: 'We can go slowly. Safety and connection do not have to be opposites.',
    },
  },
  'People-Pleasing Part': {
    'Rejection': {
      trying: 'This part may be trying to prevent rejection or conflict by meeting everyone else\'s needs first.',
      appreciation: 'Thank you, People-Pleasing Part, for trying to keep things safe and harmonious.',
      selfLed: 'I can still care about others while also caring for myself. We can learn that balance.',
    },
    'Conflict': {
      trying: 'This part may be trying to prevent conflict by anticipating and managing others\' emotional states.',
      appreciation: 'Thank you for trying to hold the peace, even when it cost you.',
      selfLed: 'Some conflict is survivable. I do not have to disappear to keep things smooth.',
    },
    default: {
      trying: 'This part may be trying to keep you safe by making others comfortable and preventing conflict or rejection.',
      appreciation: 'Thank you, People-Pleasing Part, for working so hard to keep things okay.',
      selfLed: 'My needs are allowed to matter too. We can learn to include them.',
    },
  },
  'Angry Protector': {
    'Vulnerability': {
      trying: 'This part may be using anger as armor to protect softer, more vulnerable feelings underneath.',
      appreciation: 'Thank you, Angry Protector, for trying to keep me from feeling too exposed.',
      selfLed: 'I see what is under the anger. We can protect the softer parts in a gentler way.',
    },
    'Being ignored': {
      trying: 'This part may use anger to make sure you are not dismissed or overlooked again.',
      appreciation: 'Thank you for making sure I was not invisible, even when the method was loud.',
      selfLed: 'I hear the anger. There is something important underneath it. We can listen to that.',
    },
    default: {
      trying: 'This part may be using anger as protection — to keep threats away, to be taken seriously, or to guard something tender underneath.',
      appreciation: 'Thank you, Angry Protector, for standing guard.',
      selfLed: 'I hear you. There is something worth protecting. We can find a way that costs us less.',
    },
  },
  'I do not know': {
    default: {
      trying: 'There may be a part present that is still finding its words or shape. That is allowed.',
      appreciation: 'Thank you to whatever part is here right now, even without a name.',
      selfLed: 'You do not have to be named or understood to be acknowledged. I see you are here.',
    },
  },
};

export const getPartNote = (part, protection) => {
  const partData = partsNotes[part] || partsNotes['I do not know'];
  const noteData = partData[protection] || partData.default || partsNotes['I do not know'].default;
  return noteData;
};
