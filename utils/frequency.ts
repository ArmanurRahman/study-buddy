// Helper to convert frequency array to plain sentence
export function frequencyToSentence(freqArr: boolean[]): string {
  if (!freqArr.length) return '';
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeDays = days.filter((_, idx) => freqArr[idx]);
  if (activeDays.length === 0) return '';
  if (activeDays.length === 7) return 'Every day';
  if (
    freqArr.slice(0, 5).every(Boolean) && // Mon-Fri
    !freqArr[5] &&
    !freqArr[6]
  )
    return 'Every weekday';
  if (
    !freqArr.slice(0, 5).some(Boolean) && // Mon-Fri
    freqArr[5] &&
    freqArr[6]
  )
    return 'Every weekend';
  if (activeDays.length === 1) return `Every ${activeDays[0]}`;
  if (activeDays.length === 2) return `Every ${activeDays[0]} and ${activeDays[1]}`;
  return `Every ${activeDays.slice(0, -1).join(', ')} and ${activeDays[activeDays.length - 1]}`;
}
