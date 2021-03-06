'use strict'

var util = require('util')

module.exports = function (source, options) {
  // Start Request
  var code = []
  code.push('import http.client\n')

  // Check which protocol to be used for the client connection
  var protocol = source.uriObj.protocol
  if (protocol === 'https:') {
    code.push(util.format('conn = http.client.HTTPSConnection("%s")\n', source.uriObj.host))
  } else {
    code.push(util.format('conn = http.client.HTTPConnection("%s")\n', source.uriObj.host))
  }

  // Create payload string if it exists
  var payload = JSON.stringify(source.postData.text)
  if (payload) {
    code.push(util.format('payload = %s\n', payload))
  }

  // Create Headers
  var header
  var headers = source.allHeaders
  var headerCount = Object.keys(headers).length
  if (headerCount === 1) {
    for (header in headers) {
      code.push(util.format('headers = { \'%s\': "%s" }\n', header, headers[header]))
    }
  } else if (headerCount > 1) {
    var headerLine
    var count = 1
    code.push('headers = {')
    for (header in headers) {
      if (count++ !== headerCount) {
        headerLine = util.format('    \'%s\': "%s",', header, headers[header])
      } else {
        headerLine = util.format('    \'%s\': "%s"', header, headers[header])
      }
      code.push(headerLine)
    }
    code.push('    }\n')
  }

  // Make Request
  var method = source.method
  var path = source.uriObj.path
  if (payload && headerCount) {
    code.push(util.format('conn.request("%s", "%s", payload, headers)', method, path))
  } else if (payload && !headerCount) {
    code.push(util.format('conn.request("%s", "%s", payload)', method, path))
  } else if (!payload && headerCount) {
    code.push(util.format('conn.request("%s", "%s", headers = headers)', method, path))
  } else {
    code.push(util.format('conn.request("%s", "%s")', method, path))
  }

  // Get Response
  code.push('\nres = conn.getresponse()')
  code.push('data = res.read()')
  code.push('\nprint(res.status)')
  code.push('print(data)')

  // console.log(code)
  return code.join('\n')
}

module.exports.info = {
  key: 'python3',
  title: 'http.client',
  link: 'https://docs.python.org/3/library/http.client.html',
  description: 'Python3 HTTP Client'
}
