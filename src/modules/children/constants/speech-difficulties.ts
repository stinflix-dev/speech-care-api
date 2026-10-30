export const SPEECH_DIFFICULTIES = [
  {
    label: 'Порушення звуковимови',
    value: 'speech_sound_disorder',
  },
  {
    label: 'Труднощі фонематичного сприймання',
    value: 'phonemic_perception',
  },
  {
    label: 'Порушення складової структури слова',
    value: 'syllable_structure',
  },
  {
    label: 'Обмежений словниковий запас',
    value: 'limited_vocabulary',
  },
  {
    label: 'Порушення граматичної будови мовлення',
    value: 'grammar_difficulties',
  },
  {
    label: 'Труднощі побудови речень',
    value: 'sentence_construction',
  },
  {
    label: 'Труднощі зв’язного мовлення',
    value: 'connected_speech',
  },
  {
    label: 'Труднощі розуміння мовлення',
    value: 'speech_comprehension',
  },
  {
    label: 'Порушення темпу та плавності мовлення',
    value: 'speech_fluency',
  },
  {
    label: 'Порушення голосу',
    value: 'voice_disorder',
  },
  {
    label: 'Труднощі соціальної комунікації',
    value: 'social_communication',
  },
  {
    label: 'Труднощі читання та письма',
    value: 'literacy_difficulties',
  },
  {
    label: 'Інше',
    value: 'other',
  },
] as const;

export type SpeechDifficulty = (typeof SPEECH_DIFFICULTIES)[number]['value'];
