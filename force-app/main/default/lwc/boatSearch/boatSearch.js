import { LightningElement, wire, track } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";
import BOATS_UPDATED_CHANNEL from "@salesforce/messageChannel/BoatsUpdated__c";

export default class BoatSearch extends LightningElement {
  isLoading = false;
  boatTypeId = "";
  @track selectedBoatId = "";
  boats = [];
  subscription = null;
  boatsUpdatedSubscription = null;

  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    if (!this.subscription) {
      this.subscription = subscribe(this.messageContext, BOATMC, (message) =>
        this.handleBoatSelected(message)
      );
    }
    if (!this.boatsUpdatedSubscription) {
      this.boatsUpdatedSubscription = subscribe(
        this.messageContext,
        BOATS_UPDATED_CHANNEL,
        (message) => this.handleBoatsUpdated(message)
      );
    }
  }

  handleBoatsUpdated(message) {
    this.updateBoats(message.boatsToUpdate);
  }

  handleBoatSelected(message) {
    this.selectedBoatId = message.recordId;
  }

  // Handles loading event
  handleLoading() {
    console.log("✅ Loading");
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    console.log("❌ Done loading");
    this.isLoading = false;
  }

  // Custom event triggered by boatSearchForm
  searchBoats(event) {
    const boatType = event.detail.boatTypeId;
    this.template.querySelector("c-boat-search-results").searchBoats(boatType);
  }

  createNewBoat() {}
}
