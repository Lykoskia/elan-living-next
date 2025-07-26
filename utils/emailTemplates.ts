interface FormData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  comment?: string
  referralFirstName?: string
  referralLastName?: string
  referralEmail?: string
  referralPhone?: string
  referrerFirstName?: string
  referrerLastName?: string
  referrerEmail?: string
  referrerPhone?: string
  contractorFirstName?: string
  contractorLastName?: string
  contractorEmail?: string
  contractorPhone?: string
}

type FormType = "request" | "message" | "job" | "referral"

export const formatFormData = (data: FormData, type: FormType): string => {
  const formatText = (text?: string): string => {
    if (!text) return ""
    return text.replace(/\n/g, "<br>").replace(/\r/g, "").trim()
  }

  const templates: Record<FormType, string> = {
    request: `
      <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="content" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="header">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h1>Nova prijava za njegu</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h2>📋 Podnositelj zahtjeva</h2>
                        <table class="info-table" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="info-label">Ime i prezime:</td>
                            <td class="info-value">${data.firstName} ${data.lastName}</td>
                          </tr>
                          <tr>
                            <td class="info-label">Email adresa:</td>
                            <td class="info-value">
                              <a href="mailto:${data.email}">${data.email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td class="info-label">Broj telefona:</td>
                            <td class="info-value">${data.phone}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="footer-content">
                        <p>Ovo je automatska poruka od Elan Living. Molimo ne odgovarajte na ovaj email.</p>
                        <p>Ako nas trebate kontaktirati, pošaljite email na <a href="mailto:team@elan-living.com">team@elan-living.com</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,

    message: `
      <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="content" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="header">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h1>Novi kontakt</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h2>👤 Korisnik</h2>
                        <table class="info-table" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="info-label">Ime i prezime:</td>
                            <td class="info-value">${data.firstName} ${data.lastName}</td>
                          </tr>
                          <tr>
                            <td class="info-label">Email adresa:</td>
                            <td class="info-value">
                              <a href="mailto:${data.email}">${data.email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td class="info-label">Broj telefona:</td>
                            <td class="info-value">${data.phone}</td>
                          </tr>
                        </table>
                        <h2>✉️ Poruka</h2>
                        <div class="message-box">
                          ${formatText(data.comment)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="footer-content">
                        <p>Ovo je automatska poruka od Elan Living. Molimo ne odgovarajte na ovaj email.</p>
                        <p>Ako nas trebate kontaktirati, pošaljite email na <a href="mailto:team@elan-living.com">team@elan-living.com</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,

    job: `
      <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="content" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="header">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h1>Nova prijava za posao</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h2>👤 Kandidat za posao</h2>
                        <table class="info-table" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="info-label">Ime i prezime:</td>
                            <td class="info-value">${data.firstName} ${data.lastName}</td>
                          </tr>
                          <tr>
                            <td class="info-label">Email adresa:</td>
                            <td class="info-value">
                              <a href="mailto:${data.email}">${data.email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td class="info-label">Broj telefona:</td>
                            <td class="info-value">${data.phone}</td>
                          </tr>
                        </table>
                        <h2>💬 Komentar</h2>
                        <div class="message-box">
                          ${formatText(data.comment)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="footer-content">
                        <p>Ovo je automatska poruka od Elan Living. Molimo ne odgovarajte na ovaj email.</p>
                        <p>Ako nas trebate kontaktirati, pošaljite email na <a href="mailto:team@elan-living.com">team@elan-living.com</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,

    referral: `
      <table class="wrapper" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="content" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="header">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h1>Nova preporuka</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="main-content">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td>
                        <h2>👤 Preporučeni</h2>
                        <table class="info-table" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="info-label">Ime i prezime:</td>
                            <td class="info-value">${data.referralFirstName} ${data.referralLastName}</td>
                          </tr>
                          <tr>
                            <td class="info-label">Email adresa:</td>
                            <td class="info-value">
                              <a href="mailto:${data.referralEmail}">${data.referralEmail}</a>
                            </td>
                          </tr>
                          <tr>
                            <td class="info-label">Broj telefona:</td>
                            <td class="info-value">${data.referralPhone}</td>
                          </tr>
                        </table>
                        <h2>👥 Preporučitelj</h2>
                        <table class="info-table" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="info-label">Ime i prezime:</td>
                            <td class="info-value">${data.referrerFirstName} ${data.referrerLastName}</td>
                          </tr>
                          <tr>
                            <td class="info-label">Email adresa:</td>
                            <td class="info-value">
                              <a href="mailto:${data.referrerEmail}">${data.referrerEmail}</a>
                            </td>
                          </tr>
                          <tr>
                            <td class="info-label">Broj telefona:</td>
                            <td class="info-value">${data.referrerPhone}</td>
                          </tr>
                        </table>
                        <h2>💬 Komentar</h2>
                        <div class="message-box">
                          ${formatText(data.comment)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="footer-content">
                        <p>Ovo je automatska poruka od Elan Living. Molimo ne odgovarajte na ovaj email.</p>
                        <p>Ako nas trebate kontaktirati, pošaljite email na <a href="mailto:team@elan-living.com">team@elan-living.com</a></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  }

  const baseTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, table, td, div, p, a {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            border: 0;
            font-size: 14px;
            color: #333333;
          }

          body {
            width: 100% !important;
            height: 100% !important;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            background-color: #f8f9fa;
          }

          table {
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8f9fa;
            padding: 40px 20px;
          }

          .content {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .header {
            padding: 24px 30px;
            background-color: #ac7cb4;
            border-radius: 8px 8px 0 0;
          }

          h1 {
            color: #ffffff;
            font-size: 22px;
            font-weight: 600;
            margin: 0;
            text-align: center;
          }

          .main-content {
            padding: 30px;
            background-color: #ffffff;
          }

          h2 {
            color: #ac7cb4;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 20px 0;
          }

          .info-table {
            width: 100%;
            margin-bottom: 20px;
          }

          .info-label {
            width: 140px;
            padding: 8px 0;
            vertical-align: top;
            color: #666666;
            font-weight: 500;
          }

          .info-value {
            padding: 8px 0 8px 16px;
            color: #333333;
          }

          .message-box {
            background-color: #f8f9fa;
            border: 1px solid #eeeeee;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
          }

          .footer {
            padding: 20px 30px;
            background-color: #f8f9fa;
            border-top: 1px solid #eeeeee;
            border-radius: 0 0 8px 8px;
          }

          .footer-content {
            text-align: center;
          }

          .footer p {
            margin: 5px 0;
            color: #666666;
            font-size: 13px;
          }

          a {
            color: #ac7cb4;
            text-decoration: none;
          }

          @media screen and (max-width: 600px) {
            .wrapper {
              padding: 20px 10px;
            }

            .main-content, .header, .footer {
              padding: 20px;
            }

            .info-label {
              width: 120px;
            }

            .info-value {
              padding-left: 12px;
            }

            .message-box {
              padding: 12px;
            }
          }

          @media screen and (max-width: 400px) {
            .info-table {
              display: block;
            }

            .info-label, .info-value {
              display: block;
              width: 100%;
              padding: 4px 0;
            }

            .info-value {
              padding-left: 0;
              padding-bottom: 12px;
            }

            h1 {
              font-size: 20px;
            }

            h2 {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        ${templates[type]}
      </body>
    </html>
  `

  return baseTemplate
}
