import { FunctionComponent, useState } from 'react'
import { Redirect } from 'react-router-dom'
import DistributeAidWordmark from '../components/branding/DistributeAidWordmark'
import { CaptchaSolved } from '../components/CaptchaSolved'
import TextField from '../components/forms/TextField'
import FriendlyCaptcha from '../components/FriendlyCaptcha'
import { emailRegEx, tokenRegex, useAuth } from '../hooks/useAuth'

const ConfirmEmailWithTokenPage: FunctionComponent = () => {
  const { confirm, isConfirmed } = useAuth()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [captcha, setCaptcha] = useState('')

  const formValid =
    emailRegEx.test(email) && tokenRegex.test(token) && captcha.length > 0

  return (
    <main className="flex h-screen justify-center bg-navy-900 p-4">
      <div className="max-w-md w-full mt-20">
        <div className="p-4 text-center">
          <DistributeAidWordmark className="block mx-auto mb-6" height="100" />
        </div>
        <div className="bg-white rounded p-6">
          <h1 className="text-2xl mb-4 text-center">Shipment Tracker</h1>
          <p className="mb-6">
            Welcome to Distribute Aid's shipment tracker! Please log in to
            continue.
          </p>
          <form>
            <TextField
              label="Your email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={({ target: { value } }) => setEmail(value)}
            />
            <TextField
              label="Your verification token"
              type="text"
              name="token"
              value={token}
              pattern="^[0-9]{6}"
              onChange={({ target: { value } }) => setToken(value)}
            />
            {captcha.length === 0 && (
              <FriendlyCaptcha onSolution={(captcha) => setCaptcha(captcha)} />
            )}
            {/* We use this element to display so the CAPTCHA solving does not get reset, because this component will re-render when we call setCaptcha() */}
            {captcha.length !== 0 && <CaptchaSolved />}
            <button
              className="bg-navy-800 text-white text-lg px-4 py-2 rounded-sm w-full hover:bg-opacity-90"
              type="button"
              onClick={() => {
                confirm({ email, token, captcha })
              }}
              disabled={!formValid}
            >
              Verify
            </button>
          </form>
          {isConfirmed && (
            <Redirect
              to={{
                pathname: '/',
                state: { email },
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default ConfirmEmailWithTokenPage
