import { LightningElement, wire } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import getBoats from "@salesforce/apex/BoatDataService.getBoats";

export default class BoatSearch extends LightningElement {
  isLoading = false;
  boatTypeId = "";
  selectedBoatId = null;
  boats = [];
  subscription = null;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(this.messageContext, BOATMC, (message) =>
        this.handleMessage(message)
      );
    }
  }

  handleMessage(message) {
    console.log("BoatSearch: handleMessage", message);
    this.selectedBoatId = message.recordId;
  }

  // Handles loading event
  handleLoading() {
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    this.isLoading = false;
  }

  // Handles search boat event
  // This custom event comes from the form
  searchBoats(event) {
    this.handleLoading();
    this.boatTypeId = event.detail.boatTypeId;
  }

  @wire(getBoats, { boatTypeId: "$boatTypeId" })
  wiredBoats({ error, data }) {
    console.log("⛵️ BoatSearch: wiredBoats", { error, data });
    if (data) {
      this.boats = data;
    } else if (error) {
      this.boats = [];
    }
    this.handleDoneLoading();
  }

  createNewBoat() {}
}
