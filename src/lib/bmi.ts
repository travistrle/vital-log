export function calculateBMI(weightKg: number, heightM: number): number {
  const bmi = weightKg / heightM ** 2;
  return Math.round(bmi * 10) / 10;
}

export type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function getBMICategoryColor(category: BMICategory): string {
  switch (category) {
    case 'Underweight':
      return '#2196F3';
    case 'Normal':
      return '#4CAF50';
    case 'Overweight':
      return '#FF9800';
    case 'Obese':
      return '#F44336';
  }
}

export function getHealthyWeightRange(heightM: number): { minKg: number; maxKg: number } {
  return {
    minKg: Math.round(18.5 * heightM ** 2 * 10) / 10,
    maxKg: Math.round(24.9 * heightM ** 2 * 10) / 10,
  };
}
