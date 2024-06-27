/**
 * vCard formatter for formatting vCards in VCF format
 */
;(function vCardFormatter() {
  let majorVersion = '3'

  /**
   * Encode string
   * @param  {String}     value to encode
   * @return {String}     encoded string
   */
  function encode(value) {
    if (value) {
      if (typeof value !== 'string') {
        value = '' + value
      }
      return value.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
    }
    return ''
  }

  /**
   * Return new line characters
   * @return {String} new line characters
   */
  function newline() {
    return '\r\n'
  }

  /**
   * Get formatted photo
   * @param  {String} photoType       Photo type (PHOTO, LOGO)
   * @param  {String} url             URL to attach photo from
   * @param  {String} mediaType       Media-type of photo (JPEG, PNG, GIF)
   * @return {String}                 Formatted photo
   */
  function getFormattedPhoto(photoType, url, mediaType, base64) {
    let params
    if (majorVersion >= 4) {
      params = base64 ? ';ENCODING=b;MEDIATYPE=image/' : ';MEDIATYPE=image/'
    } else if (majorVersion === 3) {
      params = base64 ? ';ENCODING=b;TYPE=' : ';TYPE='
    } else {
      params = base64 ? ';ENCODING=BASE64;' : ';'
    }

    const formattedPhoto = photoType + params + mediaType + ':' + encode(url) + newline()
    return formattedPhoto
  }

  /**
   * Get formatted address
   * @param  {object}         address
   * @param  {object}         encoding prefix
   * @return {String}         Formatted address
   */
  function getFormattedAddress(encodingPrefix, address) {
    let formattedAddress = ''

    if (
      address.details.label ||
      address.details.street ||
      address.details.city ||
      address.details.stateProvince ||
      address.details.postalCode ||
      address.details.countryRegion
    ) {
      if (majorVersion >= 4) {
        formattedAddress =
          'ADR' +
          encodingPrefix +
          ';TYPE=' +
          address.type +
          (address.details.label ? ';LABEL="' + encode(address.details.label) + '"' : '') +
          ':;;' +
          encode(address.details.street) +
          ';' +
          encode(address.details.city) +
          ';' +
          encode(address.details.stateProvince) +
          ';' +
          encode(address.details.postalCode) +
          ';' +
          encode(address.details.countryRegion) +
          newline()
      } else {
        if (address.details.label) {
          formattedAddress =
            'LABEL' +
            encodingPrefix +
            ';TYPE=' +
            address.type +
            ':' +
            encode(address.details.label) +
            newline()
        }
        formattedAddress +=
          'ADR' +
          encodingPrefix +
          ';TYPE=' +
          address.type +
          ':;;' +
          encode(address.details.street) +
          ';' +
          encode(address.details.city) +
          ';' +
          encode(address.details.stateProvince) +
          ';' +
          encode(address.details.postalCode) +
          ';' +
          encode(address.details.countryRegion) +
          newline()
      }
    }

    return formattedAddress
  }

  /**
   * Convert date to YYYYMMDD format
   * @param  {Date}       date to encode
   * @return {String}     encoded date
   */
  function YYYYMMDD(date) {
    return (
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2)
    )
  }

  module.exports = {
    /**
     * Get formatted vCard in VCF format
     * @param  {object}     vCard object
     * @return {String}     Formatted vCard in VCF format
     */
    getFormattedString: function (vCard) {
      majorVersion = vCard.getMajorVersion()

      let formattedVCardString = ''
      formattedVCardString += 'BEGIN:VCARD' + newline()
      formattedVCardString += 'VERSION:' + vCard.version + newline()

      const encodingPrefix = majorVersion >= 4 ? '' : ';CHARSET=UTF-8'
      let formattedName = vCard.formattedName

      if (!formattedName) {
        formattedName = ''

        ;[vCard.firstName, vCard.middleName, vCard.lastName].forEach(function (name) {
          if (name) {
            if (formattedName) {
              formattedName += ' '
            }
          }
          formattedName += name
        })
      }

      formattedVCardString += 'FN' + encodingPrefix + ':' + encode(formattedName) + newline()
      formattedVCardString +=
        'N' +
        encodingPrefix +
        ':' +
        encode(vCard.lastName) +
        ';' +
        encode(vCard.firstName) +
        ';' +
        encode(vCard.middleName) +
        ';' +
        encode(vCard.namePrefix) +
        ';' +
        encode(vCard.nameSuffix) +
        newline()

      if (vCard.nickname && majorVersion >= 3) {
        formattedVCardString +=
          'NICKNAME' + encodingPrefix + ':' + encode(vCard.nickname) + newline()
      }

      if (vCard.gender) {
        formattedVCardString += 'GENDER:' + encode(vCard.gender) + newline()
      }

      if (vCard.uid) {
        formattedVCardString += 'UID' + encodingPrefix + ':' + encode(vCard.uid) + newline()
      }

      if (vCard.birthday) {
        formattedVCardString += 'BDAY:' + YYYYMMDD(vCard.birthday) + newline()
      }

      if (vCard.anniversary) {
        formattedVCardString += 'ANNIVERSARY:' + YYYYMMDD(vCard.anniversary) + newline()
      }

      if (vCard.email) {
        if (!Array.isArray(vCard.email)) {
          vCard.email = [vCard.email]
        }
        vCard.email.forEach(function (address) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';type=HOME:' + encode(address) + newline()
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';type=HOME,INTERNET:' + encode(address) + newline()
          } else {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';HOME;INTERNET:' + encode(address) + newline()
          }
        })
      }

      if (vCard.workEmail) {
        if (!Array.isArray(vCard.workEmail)) {
          vCard.workEmail = [vCard.workEmail]
        }
        vCard.workEmail.forEach(function (address) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';type=WORK:' + encode(address) + newline()
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';type=WORK,INTERNET:' + encode(address) + newline()
          } else {
            formattedVCardString +=
              'EMAIL' + encodingPrefix + ';WORK;INTERNET:' + encode(address) + newline()
          }
        })
      }

      if (vCard.otherEmail) {
        if (!Array.isArray(vCard.otherEmail)) {
          vCard.otherEmail = [vCard.otherEmail]
        }
        vCard.otherEmail.forEach(function (address) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'EMAIL' +
              encodingPrefix +
              ';type=' +
              address.label +
              ':' +
              encode(address.value) +
              newline()
          } else if (majorVersion >= 3 && majorVersion < 4) {
            formattedVCardString +=
              'EMAIL' +
              encodingPrefix +
              ';type=' +
              address.label +
              ',INTERNET:' +
              encode(address.value) +
              newline()
          } else {
            formattedVCardString +=
              'EMAIL' +
              encodingPrefix +
              ';' +
              address.label +
              ';INTERNET:' +
              encode(address.value) +
              newline()
          }
        })
      }

      if (vCard.logo.url) {
        formattedVCardString += getFormattedPhoto(
          'LOGO',
          vCard.logo.url,
          vCard.logo.mediaType,
          vCard.logo.base64
        )
      }

      if (vCard.photo.url) {
        formattedVCardString += getFormattedPhoto(
          'PHOTO',
          vCard.photo.url,
          vCard.photo.mediaType,
          vCard.photo.base64
        )
      }

      if (vCard.cellPhone) {
        if (!Array.isArray(vCard.cellPhone)) {
          vCard.cellPhone = [vCard.cellPhone]
        }
        vCard.cellPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,cell":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=CELL:' + encode(number) + newline()
          }
        })
      }

      if (vCard.pagerPhone) {
        if (!Array.isArray(vCard.pagerPhone)) {
          vCard.pagerPhone = [vCard.pagerPhone]
        }
        vCard.pagerPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="pager,cell":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=PAGER:' + encode(number) + newline()
          }
        })
      }

      if (vCard.homePhone) {
        if (!Array.isArray(vCard.homePhone)) {
          vCard.homePhone = [vCard.homePhone]
        }
        vCard.homePhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,home":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=HOME,VOICE:' + encode(number) + newline()
          }
        })
      }

      if (vCard.workPhone) {
        if (!Array.isArray(vCard.workPhone)) {
          vCard.workPhone = [vCard.workPhone]
        }
        vCard.workPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,work":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=WORK,VOICE:' + encode(number) + newline()
          }
        })
      }

      if (vCard.homeFax) {
        if (!Array.isArray(vCard.homeFax)) {
          vCard.homeFax = [vCard.homeFax]
        }
        vCard.homeFax.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="fax,home":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=HOME,FAX:' + encode(number) + newline()
          }
        })
      }

      if (vCard.workFax) {
        if (!Array.isArray(vCard.workFax)) {
          vCard.workFax = [vCard.workFax]
        }
        vCard.workFax.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="fax,work":tel:' + encode(number) + newline()
          } else {
            formattedVCardString += 'TEL;TYPE=WORK,FAX:' + encode(number) + newline()
          }
        })
      }

      if (vCard.otherPhone) {
        if (!Array.isArray(vCard.otherPhone)) {
          vCard.otherPhone = [vCard.otherPhone]
        }
        vCard.otherPhone.forEach(function (number) {
          if (majorVersion >= 4) {
            formattedVCardString +=
              'TEL;VALUE=uri;TYPE="voice,' +
              number.label +
              '":tel:' +
              encode(number.value) +
              newline()
          } else {
            formattedVCardString +=
              'TEL;TYPE=' + number.label + ':' + encode(number.value) + newline()
          }
        })
      }

      if (vCard.homeAddress) {
        if (!Array.isArray(vCard.homeAddress)) {
          vCard.homeAddress = [vCard.homeAddress]
        }
        vCard.homeAddress.forEach(function (element) {
          let address = {
            details: element,
            type: 'HOME',
          }
          formattedVCardString += getFormattedAddress(encodingPrefix, address)
        })
      }

      if (vCard.workAddress) {
        if (!Array.isArray(vCard.workAddress)) {
          vCard.workAddress = [vCard.workAddress]
        }
        vCard.workAddress.forEach(function (element) {
          let address = {
            details: element,
            type: 'WORK',
          }
          formattedVCardString += getFormattedAddress(encodingPrefix, address)
        })
      }

      if (vCard.otherAddress) {
        if (!Array.isArray(vCard.otherAddress)) {
          vCard.otherAddress = [vCard.otherAddress]
        }
        vCard.otherAddress.forEach(function (element) {
          let address = {
            details: element,
            type: element.label.toUpperCase(),
          }
          formattedVCardString += getFormattedAddress(encodingPrefix, address)
        })
      }

      if (vCard.title) {
        formattedVCardString += 'TITLE' + encodingPrefix + ':' + encode(vCard.title) + newline()
      }

      if (vCard.role) {
        formattedVCardString += 'ROLE' + encodingPrefix + ':' + encode(vCard.role) + newline()
      }

      if (vCard.organization) {
        formattedVCardString +=
          'ORG' + encodingPrefix + ':' + encode(vCard.organization) + newline()
      }

      if (vCard.url) {
        if (!Array.isArray(vCard.url)) {
          vCard.url = [vCard.url]
        }

        vCard.url.forEach(function (url) {
          formattedVCardString +=
            'URL' + encodingPrefix + ';type=' + url.label + ':' + encode(url.value) + newline()
        })
      }

      if (vCard.workUrl) {
        formattedVCardString +=
          'URL;type=WORK' + encodingPrefix + ':' + encode(vCard.workUrl) + newline()
      }

      if (vCard.note) {
        formattedVCardString += 'NOTE' + encodingPrefix + ':' + encode(vCard.note) + newline()
      }

      if (vCard.socialUrls) {
        for (let key in vCard.socialUrls) {
          if (vCard.socialUrls.hasOwnProperty(key) && vCard.socialUrls[key]) {
            formattedVCardString += 'IMPP:' + key + ':' + encode(vCard.socialUrls[key]) + newline()
          }
        }
      }

      if (vCard.source) {
        formattedVCardString += 'SOURCE' + encodingPrefix + ':' + encode(vCard.source) + newline()
      }

      formattedVCardString += 'REV:' + new Date().toISOString() + newline()

      if (vCard.isOrganization) {
        formattedVCardString += 'X-ABShowAs:COMPANY' + newline()
      }

      formattedVCardString += 'END:VCARD' + newline()
      return formattedVCardString
    },
  }
})()
