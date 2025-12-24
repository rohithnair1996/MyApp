// useWalker.ts
import { useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  cancelAnimation,
} from 'react-native-reanimated';

export function useWalker(startX: number, startY: number) {
  const x = useSharedValue(startX);
  const y = useSharedValue(startY);
  const walkCycle = useSharedValue(0); // 0..1..0..1...

  const walkTo = useCallback((destX: number, destY: number) => {
    'worklet'; // this function body will run on UI thread when used inside UI work

    // 1. Compute distance
    const dx = destX - x.value;
    const dy = destY - y.value;
    const distance = Math.sqrt(dx * dx + dy * dy); // pixels

    // 2. Decide speed
    const speed = 100; // pixels per second (you can change)
    const duration = (distance / speed) * 1000; // ms

    if (distance < 1) {
      // Already there => don't animate
      return;
    }

    // 3. Start walking animation (looping)
    walkCycle.value = withRepeat(
      withTiming(1, { duration: 400 }), // 0 → 1 in 400ms
      -1,                               // infinite
      true                              // 0 → 1 → 0 → 1 ...
    );

    // 4. Animate X and Y to destination
    x.value = withTiming(destX, { duration }, (finished) => {
      if (finished) {
        // 5. Stop walking when X reach destination
        cancelAnimation(walkCycle);
        walkCycle.value = 0; // reset pose
      }
    });

    y.value = withTiming(destY, { duration });
  }, []);

  return { x, y, walkCycle, walkTo };
}
