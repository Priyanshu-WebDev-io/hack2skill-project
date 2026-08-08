const { getRandomTopic, TECH_TOPICS } = require('../src/utils/pseudoAiTopics');

describe('Pseudo-AI Topic Generator', () => {
  test('TECH_TOPICS should contain at least 50 trending topics', () => {
    expect(TECH_TOPICS).toBeDefined();
    expect(TECH_TOPICS.length).toBeGreaterThanOrEqual(50);
  });

  test('getRandomTopic should return a string from the topics array', () => {
    const topic = getRandomTopic();
    expect(typeof topic).toBe('string');
    expect(TECH_TOPICS).toContain(topic);
  });

  test('getRandomTopic should return fallback if array is somehow emptied', () => {
    // Mock the array to be empty temporarily
    const originalTopics = [...TECH_TOPICS];
    TECH_TOPICS.length = 0;
    
    const fallback = getRandomTopic('Emergency Topic');
    expect(fallback).toBe('Emergency Topic');
    
    // Restore
    TECH_TOPICS.push(...originalTopics);
  });
});
