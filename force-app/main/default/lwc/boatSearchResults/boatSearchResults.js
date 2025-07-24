import { LightningElement, api, wire } from "lwc";
import { MessageContext, publish } from "lightning/messageService";
import BOAT_SELECTED_CHANNEL from "@salesforce/messageChannel/BoatSelected__c";
import BOATS_UPDATED_CHANNEL from "@salesforce/messageChannel/BoatsUpdated__c";

export default class BoatSearchResults extends LightningElement {
  @api boats = [];
  columns = [
    { label: "Name", fieldName: "Name", type: "text", editable: true },
    { label: "Length", fieldName: "Length__c", type: "number", editable: true },
    { label: "Price", fieldName: "Price__c", type: "currency", editable: true },
    {
      label: "Description",
      fieldName: "Description__c",
      type: "text",
      editable: true
    }
  ];
  @api selectedBoatId;
  @wire(MessageContext)
  messageContext;

  handleBoatSelected(event) {
    publish(this.messageContext, BOAT_SELECTED_CHANNEL, {
      recordId: event.detail.boatId
    });
  }

  handleSave(event) {
    const draftValues = event.detail.draftValues;
    const updatedBoat = this.boats.find(
      (boat) => boat.Id === draftValues[0].Id
    );
    console.log("⛵️ BoatSearchResults: handleSave", updatedBoat, draftValues);
    if (updatedBoat) {
      publish(this.messageContext, BOATS_UPDATED_CHANNEL, {
        boatsToUpdate: [{ ...updatedBoat, ...draftValues[0] }]
      });
    }
  }
}
