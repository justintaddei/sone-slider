Remaps YouTube's volume slider to be **perceptually** linear.

YouTube's volume slider is linear in amplitude, but the way you hear sound is not.
The result is that majority of the perceived control is in the lower 20-30% of the slider, making it difficult
to precisely adjust the volume.

Sone Slider intercepts the volume API and applies a power-law curve (`amplitude = slider^(5/3)`) so the slider behaves perceptually. Moving the slider changes the loudness by the same **perceived** amount regardless of where you are in volume range.

The popup shows the remapped curve alongside the default linear response, with a live marker at the current volume. There's a toggle to disable it if you want to compare.
