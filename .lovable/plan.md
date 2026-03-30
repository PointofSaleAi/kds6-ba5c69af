

## Make Email/Password the Primary Login

**What changes:** In `SignInScreen.tsx`, flip the default value of `useEmail` from `false` to `true` so the email/password form shows first, with PIN pad as the secondary option.

### File: `src/pages/SignInScreen.tsx`
- Change `const [useEmail, setUseEmail] = useState(false)` to `useState(true)`

One-line change. No other files affected.

