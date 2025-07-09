import { LightningElement, api } from "lwc";
import { MessageContext, publish } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import { wire } from "lwc";

export default class BoatSearchResults extends LightningElement {
  @api boats = [];
  @api selectedBoatId;
  @wire(MessageContext)
  messageContext;

  handleBoatSelected(event) {
    publish(this.messageContext, BOATMC, { recordId: event.detail.boatId });
  }
}
