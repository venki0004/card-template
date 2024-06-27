"use strict";
const { validate: uuidValidate } = require("uuid");
const {
  renderProfileMissingHTML,
  renderHTML,
  renderHTML2,
  getUserCardData,
  addDialCode,
  cardActivityLogEvent,
  generateSignedUrl,
  verifySignedUrl,
} = require("../helpers/VCardGeneration");
const vCardJS = require("../VCard");
const xssFilters = require('xss-filters');
class VCardController {
  /**
   * Validate the Card URL
   *
   * @param object request
   * @param object response
   *
   * @return
   */
  static async validate(request, response) {
    try {
      if (!uuidValidate(xssFilters.inHTMLData(request.params.id))) {
        let html = renderProfileMissingHTML();
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Profile seems missing or Provided link is invalid"
        );
        return response.send(html);
      }
      let employee = await getUserCardData(xssFilters.inHTMLData(request.params.id));
      if (!employee) {
        let html = renderProfileMissingHTML();
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Profile seems missing or Provided link is invalid"
        );
        return response.send(html);
      }
      const now = new Date();
      const expiresIn = now.setMinutes(now.getMinutes() + 10); // 10 minutes

      const url = generateSignedUrl(
        "/download/" +  employee.card_uuid,
        request,
        expiresIn
      );
      return response.redirect(url);
    } catch (exception) {
      let html = renderProfileMissingHTML();
      html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
      html = html.replace(
        "[ERROR_MESSAGE]",
        "Profile seems missing or Provided link is invalid"
      );
      return response.send(html);
    }
  }

  /**
   * Validate the Card URL
   *
   * @param object request
   * @param object response
   *
   * @return
   */
  static async download(request, response) {
    try {
      let html = renderProfileMissingHTML();
      if (!uuidValidate(xssFilters.inHTMLData(request.params.id))) {
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Profile seems missing or Provided link is invalid"
        );
        return response.send(html);
      }

      if (
        !verifySignedUrl(
          xssFilters.inHTMLData(request.path),
          xssFilters.inHTMLData(request.query.signature),
          xssFilters.inHTMLData(request.query.expires),
          request
        )
      ) {
        let html = renderProfileMissingHTML();
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Provided link is invalid or expired!."
        );
        return response.send(html);
      }

      let employee = await getUserCardData(xssFilters.inHTMLData(request.params.id));
      if (!employee) {
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Profile seems missing or Provided link is invalid"
        );
        return response.send(html);
      }

      const vCard = vCardJS();
      const data = employee;
      vCard["firstName"] = data.name;
      vCard["organization"] = "Axis Mutual Fund";
      vCard["tile"] = `${data.designation}  ${data.department}`;
      vCard["workEmail"] = [data.email];
      let phones = [addDialCode(data.primary_phone)];
      if (data.whatsapp_number && addDialCode(data.primary_phone) !== addDialCode(data.whatsapp_number)) {
        phones.push(addDialCode(data.whatsapp_number));
      }
      vCard["workPhone"] = phones;
      vCard["url"] = ["https://www.axismf.com"];
      const parts = data.work_location.split(",").map((part) => part.trim());
      const postalCode = parts.pop().split("-").pop().trim();
      const street = parts.join(", ");
      let addressObj = {
        label: "Work",
        street: street,
        city: "Mumbai",
        stateProvince: "Maharashtra",
        postalCode: postalCode,
        countryRegion: "India",
      };
      vCard["workAddress"] = [addressObj];

      if (data.image_base64)
        vCard.photo.embedFromString(data.image_base64, "image/png");
      html =
        data.card_type === "MF"
          ? renderHTML(data, vCard.getFormattedString(),response.locals.nonce)
          : renderHTML2(data, vCard.getFormattedString(),response.locals.nonce);
      await cardActivityLogEvent({
        card_id: xssFilters.inHTMLData(request.params.id),
        action: "CARD_SHARED",
        message: "Details shared on card tap",
      });
      return response.send(html);
    } catch (exception) {
      let html = renderProfileMissingHTML();
      html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
      html = html.replace(
        "[ERROR_MESSAGE]",
        "Profile seems missing or provided link is invalid"
      );
      return response.send(html);
    }
  }

  /**
   * Download log event
   *
   * @param object request
   * @param object response
   *
   * @return
   */
  static async logEvent(request, response) {
    try {
      let html = renderProfileMissingHTML();
      if (!uuidValidate(xssFilters.inHTMLData(request.params.id))) {
        html = html.replace("[ERROR_TITLE]", "Uh Ooh! sorry!");
        html = html.replace(
          "[ERROR_MESSAGE]",
          "Profile seems missing or Provided link is invalid"
        );
        return response.send(html);
      }
      await cardActivityLogEvent({
        card_id: xssFilters.inHTMLData(request.params.id),
        action: "CONTACT_DOWNLOADED",
        message: "Contact details Download on save button clicked",
      });
      return response.send("OK");
    } catch (exception) {
      return response.send("OK");
    }
  }
}

module.exports = VCardController;
