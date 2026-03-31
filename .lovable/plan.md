

## Match PIN Pad Screen to Reference Design

Comparing the attached reference screenshot against the current implementation, several sizing and spacing mismatches need correction.

### What Changes

**File: `src/pages/PinPadScreen.tsx`**

1. **PIN pad container width**: Increase `maxWidth` from `420px` to `480px` to match the wider keypad in the reference

2. **Button height**: Increase from `56px` to `72px` - the reference shows taller, more substantial buttons

3. **Button font size**: Increase from `20px` to `24px` - digits are visibly larger in the reference

4. **Button border radius**: Increase from `6px` to `8px` for softer corners matching reference

5. **Grid gap**: Increase from `6px` to `8px` for more breathing room between keys

6. **Asterisk size**: Increase from `3.5rem` to `4.5rem` - reference asterisks are noticeably larger and span the full keypad width

7. **Asterisk spacing**: Change from `px-4` to `px-2` so they spread wider across the container

8. **Asterisk bottom margin**: Increase from `mb-5` to `mb-8` for more gap before keypad

9. **Label text**: Increase from `text-sm` (14px) to `text-base` (16px) with more bottom margin (`mb-4`)

10. **Sign in with email button**: Increase height from `50px` to `60px`, font size from `14px` to `16px`, margin-top from `6px` to `10px`

11. **Left section clock**: Already at `8rem` which looks correct. Adjust `letterSpacing` to `-4px` for tighter digits matching reference

12. **AM/PM text**: Increase from `text-4xl` to `text-5xl` to better match reference proportions

No structural or behavioral changes - purely sizing and spacing adjustments.

