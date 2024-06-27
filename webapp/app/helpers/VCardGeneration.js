"use strict";
const axios = require("axios");
const crypto = require("crypto");
const schemesList = ["http:", "https:"];
const xssFilters = require('xss-filters');
const domainsList = [
  "bvebjyy22b.execute-api.ap-south-1.amazonaws.com",
];

function addDialCode(phoneNumber) {
  const regex = /^\+91/;
  // Check if the phone number already has the dial code
  if (!regex.test(phoneNumber)) {
    // Add the dial code if not present
    phoneNumber = "+91" + phoneNumber;
  }
  return phoneNumber;
}

const generateWhatsAppMessage = (data) => {
  return `
      Hi,
  
      Happy to connect with you.
      Please click the link to get my business contact details.
      ${process.env.APP_HOST_URL}/${data.uuid}
  
      Regards,
      ${data.name}
      Axis Asset Management
    `;
};

function renderHTML(response, vCardFormattedText, nonce) {
  let meta = JSON.parse(JSON.stringify(response));
  let data = {
    image_url: meta.image_base64 || "",
    name: `${meta.name}`,
    job: meta.designation,
    company: "Axis Mutual Fund",
    bio: "",
    title: meta.title,
    ...meta,
  };

  let html = `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title> ${response.name} | ${response.designation}</title>
  
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet">
          <script nonce="${nonce}" src="/js/qrcode.min.js"></script>

          <script type="text/javascript" nonce="${nonce}">
              function download() {
                 logEvent();
                  let content = "${encodeURIComponent(vCardFormattedText)}";
                  window.open("data:text/x-vcard;urlencoded," + content)
              }
              function _base64ToArrayBuffer(base64) {
                  var binary_string = window.atob(base64);
                  var len = binary_string.length;
                  var bytes = new Uint8Array(len);
                  for (var i = 0; i < len; i++) {
                      bytes[i] = binary_string.charCodeAt(i);
                  }
                  return bytes.buffer;
              }

              function logEvent() {
                const http = new XMLHttpRequest()
                http.open('put', '/log-event/${data.card_uuid}')
                http.setRequestHeader('Content-type', 'application/json')
                http.send('');
                http.onload = function () {
                }
              }
          </script>
          <script type="text/javascript" nonce='${nonce}'>

          let show = true
          window.onload = function() {
            if(document.getElementById("qrcode")){
                new QRCode(document.getElementById("qrcode"), "${
                  process.env.APP_HOST_URL
                }/${meta.card_uuid}");
            }
          };
          function modalOpen() {
              document.getElementById("my-modal").style.display = "block";
          }
  
          function modalClose() {
              document.getElementById("my-modal").style.display = "none";
          }

          function modalOpen1() {
            document.getElementById("my-modal1").style.display = "block";
        }

        function modalClose1() {
            document.getElementById("my-modal1").style.display = "none";
        }
        
          function toggleAccordion() {
              if (show) {
                  document.getElementById("accordion-details").style.display = "block";
                  show = false
                  document.getElementById("acc-arrow").style.rotate = "-180deg";
              }
              else {
                  document.getElementById("accordion-details").style.display = "none";
                  document.getElementById("acc-arrow").style.rotate = "-0deg";
                  show = true
              }
          }
          function toggleAccordionAddress() {
              if (show) {
                  document.getElementById("accordion-details-address").style.display = "block";
                  show = false
                  document.getElementById("acc-arrow-address").style.rotate = "-180deg";
              }
              else {
                  document.getElementById("accordion-details-address").style.display = "none";
                  document.getElementById("acc-arrow-address").style.rotate = "-0deg";
                  show = true
              }
          }
  
       </script>
  </head>
  
  <style>
      body {
          padding: 0;
          margin: 0;
          font-family: "Lato", sans-serif;
      }
  
      .container {
          @media screen and (min-width: 1024px) {
              width: 320px;
          }
          width: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }
  
      .header-image {
          @media screen and (min-width: 1024px) {
              width: 100%;
          }
          width: 100vw;
          object-fit: cover;
      }
  
      .maroon-box {
          margin-top: 63px;
          width: 90%;
          background-color: #98144D;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 6px;
          border-radius: 16px;
          margin-left: 10px;
      }
      img {
        user-drag: none;
        -webkit-user-drag: none;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
  
      .person-image {
        width: 143px;
        height: 139px;
        border-radius: 8px;
        object-fit: contain;
      }
  
      .p-image-container {
          margin-top: -50px;
          width: '100%';
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }
  
      .text-container {
          color: white;
          text-align: center;
  
      }
  
      .secondary-btn {
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          align-items: center;
          font-size: 13px;
          width: 100%;
          cursor: pointer;
          padding: 11px 8px;
          border: 1px solid #E5E5E5;
          background-color: transparent;
          color: #000000;
      }
  
      .btn-container {
        display: flex;
        flex-direction: row;
        gap: 12px;
        width: 300px;
        align-items: center;
        justify-content: center;
        margin-top: 16px;

      }
  
      .contact-details {
        margin-top: 28px;
        background-color: #D9D9D9;
        width: 300px;
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        position: relative;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 7px 16px;
        border-radius: 11px;
      }
  
      .icon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
      }
  
      .icon-main-container {
        display: flex;
        flex-direction: row;
        gap: 2rem;
        align-items: center;
        padding-top: 22px;
        width:75%;
        justify-content: space-between;
      }
  
      .icon-btn {
          background-color: transparent;
          padding: 0;
          margin: 0;
          border: none;
      }
  
      .main-title {
          line-height: 0px;
          font-size: 23px;
          color: white;
          font-weight: 400;
      }
  
      .secondary-txt {
          line-height: 4px;
          font-size: 15px;
          color: white;
          font-weight: 400;
      }
  
      .icon-text {
          line-height: 4px;
          font-size: 14px;
          font-weight: 400;
      }
      .w-full {
        width: 100%;
     }
     .py-6 {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    
    .px-6 {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    .flex {
        display: flex;
    }
    
    .items-center {
        align-items: center;
    }
    
    .justify-between {
        justify-content: space-between;
    }
    .border-[#2D2D2D] {
        border-color: #2D2D2D;
    }

    .text-white {
        color: #000000;
    }
    
    .font-medium {
        font-weight: 500;
    }

    .text-sm {
        font-size: 0.875rem;
    }
    
    .hidden {
        display: none;
    }
    .expand-icon-border {
        border-top: 1px solid #C4C4C4 !important;
    }
    .expand-icon{
        background-color: #D9D9D9;
        padding: 0;
        margin: 0;
        border: none;
    }
    .pad-sec{
        padding: 2px 8px;
    }
    .address-sec{
        padding: 0px 2px;
        margin: 12px 2px;
    }
    .close-icon{
        background-color: transparent;
        border: none;
        position: relative;
        top: 10px;
        right: 8px;
    }
    .contact-info{
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 11px;
        align-items: baseline;
        width: 100%;
        margin: 8px 2px;
        padding: 0px 13px;
    }
    .contact-info-list {
        display: flex;
        align-items: center;
        gap: 10px;
    }
  </style>
  
  <body>
      <div class="container">
      <div  onclick="modalClose()" id="my-modal" style="display: none; width: 100%; height: 100%; position: absolute; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.2); z-index: 21; padding: 1.5rem;top: 0;">

      <div style="max-width: 300px;margin: auto; min-height: 250px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; overflow: hidden; margin-top: 40px;">
  
          <div style="background-color: #98134d; width: 100%;text-align: center; position: relative;">
  
              <p style="font-size: 1.125rem; color: #fff; font-weight: 500;">Share Contact by QR</p>
  
              <div style="position: absolute; right: 1rem; top: 0.625rem;">
                  <button onclick="modalClose();" class="close-icon"><img src="/images/close.svg" alt="close" style="width: 14px; height: 14px;" /></button>
              </div>
  
          </div>
  
          <div  onclick="modalClose()" style="background-color: #fff; width: 100%; padding: 1.5rem; display: flex; align-items: center; justify-content: center;">
              <div id="qrcode" > </div>
          </div>
  
      </div>
   </div>

   <div  onclick="modalClose1()" id="my-modal1" style="display: none; width: 100%; height: 100%; position: absolute; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.2); z-index: 21; padding: 1.5rem;top: 10%;">

      <div style="max-width: 300px;margin: auto; min-height: 250px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; overflow: hidden; margin-top: 40px;">
  
          <div style="background-color: #98134d; width: 100%;text-align: center; position: relative;">
  
              <p style="font-size: 1.125rem; color: #fff; font-weight: 500;">Contact No</p>
  
              <div style="position: absolute; right: 1rem; top: 0.625rem;">
                  <button onclick="modalClose();" class="close-icon"><img src="/images/close.svg" alt="close" style="width: 14px; height: 14px;" /></button>
              </div>
  
          </div>
  
          <div  onclick="modalClose1()" style="background-color: #fff; width: 100%; padding: 1.5rem; display: flex; align-items: center; justify-content: center;">
             <div style="display:flex;flex-direction: column;gap: 7px;">
             <p style="margin: 0px;">  <span><a href="tel:${addDialCode(
               meta.primary_phone
             )}">${addDialCode(meta.primary_phone)}</a></span></p>
             `;
  if (meta.whatsapp_number) {
    html += `<p style="margin: 0px;">  <span><a href="tel:${addDialCode(
      meta.whatsapp_number
    )}">${addDialCode(meta.whatsapp_number)}</a></span></p>`;
  }

  html += `</div>
          </div>
  
      </div>
  
   </div>

          <div class="w-full relative">
              <img src="/images/header1.svg" alt="shape" class="header-image" />
          </div>
  
          <div class="maroon-box">
  
              <div class="p-image-container">
                  <img src="${meta.image_base64}" alt="person" class="person-image" />
              </div>
  
              <div class="text-container">
              <p class="main-title">${data.name}</p>
              <p class="secondary-txt">${data.designation}</p>
              <p class="secondary-txt">${data.department}</p>
              </div>
  
          </div>
  
          <div class="btn-container">
              <button class="secondary-btn" onclick="download()">
                  <img src="/images/save-icon2.svg" alt="save" width="24px" height="24px" />
                  <p>Save Contact</p>
              </button>
  
              <button class="secondary-btn" onclick="modalOpen()">
                  <img src="/images/qr-share-icon2.svg" alt="share" width="24px" height="24px" />
                  <p style="padding:1px">Share via QR</p>
              </button>
              `;

  html += `</div>

          <div class="icon-main-container">`;

  if (meta.whatsapp_number) {
    html += `<div class="icon-container">
            <button class="icon-btn" onclick="modalOpen1()">
            <a > <img src="/images/call.svg" alt="call" width="44px" height="44px" /> </a>
            </button>
            <p class="icon-text">Call</p>
           </div>`;
  } else {
    html += `<div class="icon-container">
               <button class="icon-btn"  style="cursor:pointer">
               <a href="tel:${addDialCode(
                 meta.primary_phone
               )}"><img src="/images/call.svg" alt="call" width="44px" height="44px" />
               </a>
               </button>
               <p class="icon-text">Call</p>
              </div>`;
  }

  if (data.whatsapp_number) {
    html += `<div class="icon-container">
        <button class="icon-btn">
        <a href="whatsapp://send?text=Hi There!&phone=${addDialCode(
          data.whatsapp_number
        )}"> <img src="/images/whatsapp.svg" alt="whatsapp.svg" width="44px" height="44px" />
        </a>
        </button>
        <p class="icon-text">Whatsapp </p>
    </div>`;
  }

  html += `
          <div class="icon-container">
              <button class="icon-btn">
              <a  rel="nofollow" href="mailto:${
                data.email
              }"> <img src="/images/email.svg" alt="email" width="44px" height="44px" /> </a>
              </button>
              <p class="icon-text">Email</p>
          </div>


      </div>
      <div class="contact-details">  
              

      <button onclick="toggleAccordionAddress()" class="w-full expand-icon">

        <div class="border-t border-[#2D2D2D] w-full flex items-center justify-between pad-sec">

            <p class="text-sm text-white font-medium">Contact Details</p>

            <img src="/images/expand-black.svg" alt="acc" id="acc-arrow-address"  />
        </div>
     </button>

     <div id="accordion-details-address" class="text-start text-white text-sm pad-sec hidden " style="width: 100%;">
        <ul class="contact-info">
          <li class="contact-info-list">
           <span> 
           <img src="/images/email2.svg" alt="email-icon" id="acc-arrow-address"  />
           </span>
           <span> ${meta.email}</span>
          </li>
          <li class="contact-info-list">
          <span> 
          <img src="/images/phone2.svg"  alt="phone-icon" id="acc-arrow-address"  />
          </span>
          <span>${addDialCode(meta.primary_phone)}</span>
         </li>
         `;
  if (meta.whatsapp_number && addDialCode(meta.primary_phone) !==addDialCode(meta.whatsapp_number)) {
    html += `<li class="contact-info-list">
            <span> 
            <img src="/images/phone2.svg"  alt="phone-icon" id="acc-arrow-address"  />
            </span>
            <span>${addDialCode(meta.whatsapp_number)}</span>
           </li>`;
  }

  html += `
         <li class="contact-info-list">
         <span> 
         <img src="/images/web.svg" alt="web-icon" id="acc-arrow-address"  />
         </span>
         <span>https://www.axismf.com</span>
        </li>
        </ul>
    </div>

      <button onclick="toggleAccordion()" class="w-full expand-icon expand-icon-border">

      <div class="border-t border-[#2D2D2D] w-full flex items-center justify-between pad-sec">

          <p class="text-sm text-white font-medium">Address</p>

          <img src="/images/expand-black.svg" alt="acc" id="acc-arrow" style="padding-right: 5px;" />
      </div>
  </button>

  <div id="accordion-details" class="text-start text-white text-sm pad-sec hidden ">
            <p class="address-sec">
             ${meta.work_location}
             ,Maharashtra, India
            </p>
  </div>
  </div>
  </div>
  </body>
  
  </html>`;

  return html;
}

function renderHTML2(response, vCardFormattedText, nonce) {
  let meta = JSON.parse(JSON.stringify(response));
  let data = {
    image_url: meta.image_base64 || "",
    name: `${meta.name}`,
    job: meta.designation,
    company: "Axis Mutual Fund",
    bio: "",
    title: meta.title,
    ...meta,
  };

  let html = `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title> ${response.name} | ${response.designation}</title>
  
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet">
          <script nonce="${nonce}" src="/js/qrcode.min.js"></script>
          <script type="text/javascript" nonce='${nonce}'>
              function download() {
                 logEvent()
                  let content = "${encodeURIComponent(vCardFormattedText)}";
                  window.open("data:text/x-vcard;urlencoded," + content)
              }

              function logEvent() {
                const http = new XMLHttpRequest()
                http.open('put', '/log-event/${data.card_uuid}')
                http.setRequestHeader('Content-type', 'application/json')
                http.send('');
                http.onload = function () {
                }
              }
              function _base64ToArrayBuffer(base64) {
                  var binary_string = window.atob(base64);
                  var len = binary_string.length;
                  var bytes = new Uint8Array(len);
                  for (var i = 0; i < len; i++) {
                      bytes[i] = binary_string.charCodeAt(i);
                  }
                  return bytes.buffer;
              }
          </script>

          <script type="text/javascript" nonce='${nonce}'>

          let show = true
          window.onload = function() {
            if(document.getElementById("qrcode")){
                new QRCode(document.getElementById("qrcode"), "${
                  process.env.APP_HOST_URL
                }/${meta.card_uuid}");
            }
          };
          function modalOpen() {
              document.getElementById("my-modal").style.display = "block";
          }
  
          function modalClose() {
              document.getElementById("my-modal").style.display = "none";
          }

          function modalOpen1() {
            document.getElementById("my-modal1").style.display = "block";
        }

        function modalClose1() {
            document.getElementById("my-modal1").style.display = "none";
        }
        
          function toggleAccordion() {
              if (show) {
                  document.getElementById("accordion-details").style.display = "block";
                  show = false
                  document.getElementById("acc-arrow").style.rotate = "-180deg";
              }
              else {
                  document.getElementById("accordion-details").style.display = "none";
                  document.getElementById("acc-arrow").style.rotate = "-0deg";
                  show = true
              }
          }
          function toggleAccordionAddress() {
              if (show) {
                  document.getElementById("accordion-details-address").style.display = "block";
                  show = false
                  document.getElementById("acc-arrow-address").style.rotate = "-180deg";
              }
              else {
                  document.getElementById("accordion-details-address").style.display = "none";
                  document.getElementById("acc-arrow-address").style.rotate = "-0deg";
                  show = true
              }
          }
  
       </script>

       
  </head>
  
  <style>
      body {
          margin: 0;
          font-family: "Lato", sans-serif;
          background-color: #19191D;
      }
  
      .container {
          @media screen and (min-width: 1024px) {
              width: 320px;
          }
  
          width: 100%;
          margin: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }
  
      .header-image {
          @media screen and (min-width: 1024px) {
              width: 100%;
          }
  
          width: 100vw;
          object-fit: cover;
      }
  
      .maroon-box {
          margin-top: 63px;
          width: 90%;
          padding: 16px;
          border-radius: 24px;
          background-color: #080808;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 6px;
          border-radius: 16px;
          margin-left: 10px;
      }
      img {
        user-drag: none;
        -webkit-user-drag: none;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }
  
  
      .person-image {
        width: 143px;
        height: 139px;
        border-radius: 8px;
        object-fit: contain;
      }
  
      .p-image-container {
          margin-top: -50px;
          width: '100%';
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
      }
  
      .text-container {
          color: white;
          text-align: center;
  
      }
  
      .secondary-btn {
          display: flex;
          flex-direction: column;
          background-color: #080808;
          border-radius: 8px;
          align-items: center;
          font-size: 13px;
          width: 100%;
          color: white;
          border:0;
          cursor: pointer;
          padding: 11px 8px;
          border: 1px solid #2E2E2E;
      }
  
      .btn-container {
          display: flex;
          flex-direction: row;
          gap: 12px;
          width: 300px;
          align-items: center;
          justify-content: center;
          margin-top: 16px;
      }
  
      .contact-details {
          margin-top: 28px;
          background-color: #080808;
          width: 300px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          align-items: center;
          justify-content: center;
          color:white;
          padding: 7px 16px;
         border-radius: 11px;
      }
  
      .icon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
      }
  
      .icon-main-container {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          align-items: center;
          padding-top: 22px;
          width:75%;
        justify-content: space-between;
      }
  
      .icon-btn {
          background-color: transparent;
          padding: 0;
          margin: 0;
          border: none;
      }
  
      .main-title {
          line-height: 0px;
          font-size: 24px;
          color: #A8861C;
          font-weight: 400;
      }
  
      .secondary-txt {
          line-height: 4px;
          font-size: 16px;
          color: white;
          font-weight: 400;
      }
  
      .icon-text {
          line-height: 4px;
          font-size: 13px;
          font-weight: 400;
          color:white;
          padding: 0;
          margin: 6px 0px;
      }
      .w-full {
        width: 100%;
     }
     .py-6 {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    
    .px-6 {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
    .flex {
        display: flex;
    }
    
    .items-center {
        align-items: center;
    }
    
    .justify-between {
        justify-content: space-between;
    }
    .border-[#2D2D2D] {
        border-color: #2D2D2D;
    }

    .text-white {
        color: #fff;
    }
    
    .font-medium {
        font-weight: 500;
    }

    .text-sm {
        font-size: 0.875rem;
    }
    
    .hidden {
        display: none;
    }
    .expand-icon-border {
        border-top: 1px solid #2D2D2D !important;
    }
    .expand-icon{
        background-color: color(srgb 0.0314 0.0314 0.0314);
        padding: 0;
        margin: 0;
        border: none;
    }
    
   .pad-sec{
    padding: 2px 8px;
   }
   .address-sec{
    padding: 0px 2px;
    margin: 12px 2px;
   }
   .close-icon{
    background-color: transparent;
    border: none;
    position: relative;
    top: 10px;
    right: 8px;
   }
   .contact-info{
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 11px;
    align-items: baseline;
    width: 100%;
    margin: 8px 2px;
    padding: 0px 13px;
   }
   .contact-info-list {
    display: flex;
    align-items: center;
    gap: 10px;
   }
  </style>
  
  <body>
      <div class="container">
      <div  onclick="modalClose()" id="my-modal" style="display: none; width: 100%; height: 100%; position: absolute; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.2); z-index: 21; padding: 1.5rem;top: 0;">

      <div style="max-width: 300px;margin: auto; min-height: 250px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; overflow: hidden; margin-top: 40px;">
  
          <div style="background-color: #080808; width: 100%;text-align: center; position: relative;">
  
              <p style="font-size: 1.125rem; color: #fff; font-weight: 500;">Share Contact by QR</p>
  
              <div style="position: absolute; right: 1rem; top: 0.625rem;">
                  <button onclick="modalClose();" class="close-icon"><img src="/images/close.svg" alt="close" style="width: 14px; height: 14px;" /></button>
              </div>
  
          </div>
  
          <div  onclick="modalClose()" style="background-color: #fff; width: 100%; padding: 1.5rem; display: flex; align-items: center; justify-content: center;">
            <div id="qrcode" > </div>
          </div>
  
      </div>
  
  </div>
  <div  onclick="modalClose1()" id="my-modal1" style="display: none;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  z-index: 21;
  padding: 1.5rem;
  top: 10%;
  }">

      <div style="max-width: 300px;margin: auto; min-height: 250px; border-radius: 20px; display: flex; flex-direction: column; align-items: center; overflow: hidden; margin-top: 40px;">
  
          <div style="background-color: #080808; width: 100%;text-align: center; position: relative;">
  
              <p style="font-size: 1.125rem; color: #fff; font-weight: 500;">Contact No</p>
  
              <div style="position: absolute; right: 1rem; top: 0.625rem;">
                  <button onclick="modalClose();" class="close-icon"><img src="/images/close.svg" alt="close" style="width: 14px; height: 14px;" /></button>
              </div>
  
          </div>
  
          <div  onclick="modalClose1()" style="background-color: #fff; width: 100%; padding: 1.5rem; display: flex; align-items: center; justify-content: center;">
             <div style="display:flex;flex-direction: column;gap: 7px;">
             <p style="margin: 0px;">  <span><a href="tel:${addDialCode(
               meta.primary_phone
             )}">${addDialCode(meta.primary_phone)}</a></span></p>
             `;
  if (meta.whatsapp_number) {
    html += `<p style="margin: 0px;">  <span><a href="tel:${addDialCode(
      meta.whatsapp_number
    )}">${addDialCode(meta.whatsapp_number)}</a></span></p>`;
  }

  html += `</div>
          </div>
      </div>
   </div>

          <div class="w-full relative">
              <img src="/images/header2.svg" alt="shape" class="header-image" />
          </div>
  
          <div class="maroon-box">
  
              <div class="p-image-container">
                  <img src="${meta.image_base64}" alt="person" class="person-image" />
              </div>
  
              <div class="text-container">
                  <p class="main-title">${data.name}</p>
                  <p class="secondary-txt">${data.designation}</p>
                  <p class="secondary-txt">${data.department}</p>
              </div>
  
          </div>
  
          <div class="btn-container">
              <button class="secondary-btn" style="cursor:pointer" onclick="download()">
                  <img src="/images/save-icon.svg" alt="save" width="20px" height="20px" />
                  <p>Save Contact</p>
              </button>
  
              <button class="secondary-btn" onclick="modalOpen()">
                  <img src="/images/share-qr.svg"  style="cursor:pointer" alt="share" width="20px" height="20px" />
                  <p style="padding:1px">Share via QR</p>
              </button>`;

  html += `</div>
          <div class="icon-main-container">`;
  if (meta.whatsapp_number) {
    html += `<div class="icon-container">
                 <button class="icon-btn" onclick="modalOpen1()">
                 <a > <img src="/images/callWhite.svg" alt="call" width="44px" height="44px" /> </a>
                 </button>
                 <p class="icon-text">Call</p>
                </div>`;
  } else {
    html += `<div class="icon-container">
                    <button class="icon-btn"  style="cursor:pointer">
                    <a href="tel:${addDialCode(
                      meta.primary_phone
                    )}"><img src="/images/callWhite.svg" alt="call" width="44px" height="44px" />
                    </a>
                    </button>
                    <p class="icon-text">Call</p>
                   </div>`;
  }

  if (data.whatsapp_number) {
    html += `<div class="icon-container">
    <button class="icon-btn"  style="cursor:pointer">
    <a href="whatsapp://send?text=Hi There!&phone=${addDialCode(
      data.whatsapp_number
    )}"><img src="/images/whatsappWhite.svg" alt="whatsapp.svg" width="44px" height="44px" />
    </a>
    </button>
    <p class="icon-text"> Whatsapp </p>
</div>`;
  }

  html += `<div class="icon-container">
                      <button class="icon-btn"  style="cursor:pointer">
                      <a rel="nofollow" href="mailto:${
                        data.email
                      }"> <img src="/images/emailWhite.svg" alt="email" width="44px" height="44px" />
                      </a>
                      </button>
                      <p class="icon-text">Email </p>
                  </div>
  
              </div>
  
          <div class="contact-details">  
              

              <button onclick="toggleAccordionAddress()" class="w-full expand-icon">

                <div class="border-t border-[#2D2D2D] w-full flex items-center justify-between pad-sec">

                    <p class="text-sm text-white font-medium">Contact Details</p>

                    <img src="/images/acc.svg" alt="acc" id="acc-arrow-address"  />
                </div>
             </button>

             <div id="accordion-details-address" class="text-start text-white text-sm pad-sec hidden " style="width: 100%;">
                <ul class="contact-info">
                  <li class="contact-info-list">
                   <span> 
                   <img src="/images/email-icon.svg" alt="email-icon" id="acc-arrow-address"  />
                   </span>
                   <span> ${meta.email}</span>
                  </li>
                  <li class="contact-info-list">
                  <span> 
                  <img src="/images/phone-icon.svg"  alt="phone-icon" id="acc-arrow-address"  />
                  </span>
                  <span>${addDialCode(meta.primary_phone)}</span>
                 </li>
                 `;
  if (meta.whatsapp_number && addDialCode(meta.primary_phone) !==addDialCode(meta.whatsapp_number)) {
    html += ` <li class="contact-info-list">
                    <span> 
                    <img src="/images/phone-icon.svg"  alt="phone-icon" id="acc-arrow-address"  />
                    </span>
                    <span>${addDialCode(meta.whatsapp_number)}</span>
                   </li>`;
  }
  html += `<li class="contact-info-list">
                 <span> 
                 <img src="/images/web-icon.svg" alt="web-icon" id="acc-arrow-address"  />
                 </span>
                 <span>https://axismf.com</span>
                </li>
                </ul>
            </div>

              <button onclick="toggleAccordion()" class="w-full expand-icon expand-icon-border">

              <div class="border-t border-[#2D2D2D] w-full flex items-center justify-between pad-sec">

                  <p class="text-sm text-white font-medium">Address</p>

                  <img src="/images/acc.svg" alt="acc" id="acc-arrow" style="padding-right: 5px;" />
              </div>
          </button>

          <div id="accordion-details" class="text-start text-white text-sm pad-sec hidden ">
                    <p class="address-sec">${meta.work_location} ,
                    Maharashtra, India</p>
          </div>
  
  
          </div>
  
          <br/>
  
  
      </div>
  </body>
  
  </html>`;

  return html;
}

function renderProfileMissingHTML() {
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://api.fontshare.com/css?f[]=author@400,700&display=swap" rel="stylesheet">
        <title></title>
        <style>
            html,
            body {
                margin: 0;
                padding: 0;
                font-family: 'Author', sans-serif;
            }
    
            .sticky {
                position: sticky;
                top: 0;
            }
    
            .container {
                max-width: 100%;
                margin-left: auto;
                margin-right: auto;
                padding-left: 24px;
                padding-right: 24px;
            }
    
            .custom-card {
                max-width: 28rem;
                margin: auto;
                padding: 1.5rem;
                background-color: #ffffff;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
            }
    
            .logo img {
                width: 150px;
            }
    
            .font-semibold {
                font-weight: 600;
            }
    
            .text-2xl {
                font-size: 1.5rem;
                line-height: 2rem;
            }
    
            .sub-title {
                color: rgba(0, 0, 0, 0.45);
            }
            .p-4 {
                padding: 1rem/* 16px */;
            }
            .mt-4 {
                margin-top: 1rem/* 16px */;
            }
            .flex-box{
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-direction: column;
            }
            .pt-8 {
                padding-top: 2rem/* 32px */;
            }
            .text-center {
                text-align: center;
            }
        </style>
    </head>
    
    <body>
        <main class="main p-4">
            <div class="sticky mt-4">
                <div class="custom-card">
                    <div class="flex-box">
                        <div class="logo">
                            <img src='/images/logo.svg' alt="Logo">
                        </div>
                        <h1 class="font-semibold text-2xl py-2">[ERROR_TITLE]</h1>
                        <p class="sub-title text-center py-4">[ERROR_MESSAGE]</p>
                    </div>
                    <p class="text-center">Scube Smart Business Card</p>
                </div>
            </div>
        </main>
    </body>
    
    </html>
    `;
}

async function base64ToNode(buffer) {
  return buffer.toString("base64");
}

function createSignature(timestamp, secretKey) {
  const message = timestamp + secretKey;
  const signature = crypto.createHash("sha256").update(message).digest("hex");
  return signature;
}

async function getUserCardData(id) {
  const url = new URL(process.env.API_SERVER_URL + "/card-info/" + id);
  if (
    schemesList.includes(url.protocol) &&
    domainsList.includes(url.hostname)
  ) {
    const config = {
      headers: {
        timestamp: Date.now(),
        "o-sign": createSignature(Date.now(), process.env.SHARED_SECRET_KEY),
      },
    };
    let validate = await axios.get(url, config).then(
      (resp) => {
        return resp.data.data;
      },
      (error) => {
        console.error(error);
        return error.data;
      }
    );
    return validate;
  }
  return "";
}

async function cardActivityLogEvent(data) {
  const url = new URL(process.env.API_SERVER_URL + "/activity-log");

  if (
    schemesList.includes(url.protocol) &&
    domainsList.includes(url.hostname)
  ) {
    const config = {
      headers: {
        timestamp: Date.now(),
        "o-sign": createSignature(Date.now(), process.env.SHARED_SECRET_KEY),
      },
    };
    let validate = await axios.post(url, data, config).then(
      (resp) => {
        return resp.data.data;
      },
      (error) => {
        console.error(error);
        return error.data;
      }
    );
    return validate;
  }
  return "";
}

function generateSignedUrl(route, request, expiresIn) {
  const signature = crypto
    .createHmac("sha256", process.env.APP_SECRET_KEY)
    .update(route)
    .update(";")
    .update(xssFilters.inHTMLData(request.params.id))
    .update(";")
    .update(String(expiresIn))
    .update(process.env.APP_SECRET_SALT)
    .update(";")
    .update(getClientId(request))
    .digest("hex");
  return `/download/${xssFilters.inHTMLData(request.params.id)}?signature=${signature}&expires=${expiresIn}`;
}

function verifySignedUrl(pathname, signature, expiresIn, request) {
  const now = Date.now();
  if (Number(expiresIn) < now) {
    return false;
  }
  // Create a HMAC-SHA256 signature.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.APP_SECRET_KEY)
    .update(pathname)
    .update(";")
    .update(xssFilters.inHTMLData(request.params.id))
    .update(";")
    .update(String(expiresIn))
    .update(process.env.APP_SECRET_SALT)
    .update(";")
    .update(getClientId(request))
    .digest("hex");
  if (signature === expectedSignature) {
    return true;
  }

  return false;
}

function getClientId(req) {
  return crypto
    .createHash("sha256")
    .update(
      (req.headers["sourceip"] || req.ip) +
        (req.headers["useragentsource"] || req.headers["user-agent"])
    )
    .digest("hex");
}

module.exports = {
  renderHTML,
  renderProfileMissingHTML,
  base64ToNode,
  renderHTML2,
  getUserCardData,
  addDialCode,
  cardActivityLogEvent,
  generateSignedUrl,
  verifySignedUrl,
};
