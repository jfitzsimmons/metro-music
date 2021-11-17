let mphAvg = 16.385464299320347;

export function pickFrequency(f: number) {
    if (f < 38.5272947947) return 1;
    if (f >= 38.5272947947 && f < 38.5837567647) return 2;
    if (f >= 38.5837567647 && f < 38.6402187347) return 3;
    if (f >= 38.6402187347 && f < 38.6966807047) return 4;
    if (f >= 38.6966807047 && f < 38.7531426747) return 5;
    if (f >= 38.7531426747) return 6;
    return 1;
  }
  
  export function getAdsr(mph: number) {
    let adsr = 1 - mph / mphAvg;
    if (adsr > 1) adsr = .99;
    if (adsr < -1) adsr = -.99;
    if (adsr < 0) adsr++;
    return adsr;
  }