import { useHapticFeedback } from '@app/hooks';

const onHapticFeedback = useHapticFeedback();

onHapticFeedback('light'); // Triggers a light haptic feedback
