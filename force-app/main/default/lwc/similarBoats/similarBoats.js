import { LightningElement, api, wire } from "lwc";
import getSimilarBoats from "@salesforce/apex/BoatDataService.getSimilarBoats";
import { subscribe, MessageContext } from "lightning/messageService";
import BOATMC from "@salesforce/messageChannel/BoatMessageChannel__c";

export default class SimilarBoats extends LightningElement {
  // Private
  relatedBoats;
  boatId;
  error;
  subscription = null;
  @wire(MessageContext)
  messageContext;

  connectedCallback() {
    if (this.subscription || this.recordId) {
      return;
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => (this.boatId = message.recordId)
    );
  }

  // public
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
    this.setAttribute("boatId", value);
  }

  @api similarBy;

  // Wire custom Apex call, using the import named getSimilarBoats
  // Populates the relatedBoats list
  @wire(getSimilarBoats, { boatId: "$boatId", similarBy: "$similarBy" })
  similarBoats({ error, data }) {
    console.log(
      "similarBoats wire called with boatId: " + this.boatId,
      data,
      error
    );
    if (data) {
      this.relatedBoats = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.relatedBoats = undefined;
    }
  }

  get getTitle() {
    return "Similar boats by " + this.similarBy;
  }
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  // Navigate to record page
  openBoatDetailPage(event) {}
}
