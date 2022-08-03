export const noCyrillic = (text: string) => {
  const regexCyrillic = (/[А-Яа-яёЁ]+/ig)
  return !text || regexCyrillic.test(String(text))
}

export const isNotEmail = (email: string) => {
  if (!email || noCyrillic(email)) {
    return true
  }

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return !re.test(String(email).toLowerCase())
}
