const owasp = require('owasp-password-strength-test')

owasp.config({
  allowPassphrases: true,
  maxLength: 64,
  minLength: 12,
  minPhraseLength: 20,
  minOptionalTestsToPass: 4
})

const checkPassword = (password, password2) => {
  const result = {}
  const equal = password === password2
  if (!equal) {
    result.success = false
    result.errors = ['The passwords do not match.']
    return result
  }

  const pwtest = owasp.test(password)

  if (pwtest.errors.length < 1) {
    result.success = true
    return result
  } else {
    result.success = false
    result.errors = pwtest.errors
    return result
  }
}

module.exports = checkPassword
