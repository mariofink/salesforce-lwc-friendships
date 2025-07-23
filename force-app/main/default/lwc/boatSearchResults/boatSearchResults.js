import { LightningElement, api, wire } from "lwc";
import { MessageContext, publish } from "lightning/messageService";
import BOAT_SELECTED_CHANNEL from "@salesforce/messageChannel/BoatSelected__c";

export default class BoatSearchResults extends LightningElement {
  @api boats = [];
  @api selectedBoatId;
  @wire(MessageContext)
  messageContext;

  handleBoatSelected(event) {
    publish(this.messageContext, BOAT_SELECTED_CHANNEL, {
      recordId: event.detail.boatId
    });
  }
  }
}
