export class AECDataModelPropsPanelPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(extension, id, title) {
      super(extension.viewer.container, id, title);
      this.extension = extension;
      this.graphqlUrl = 'https://developer.api.autodesk.com/aecdatamodel/graphql';
  }

  async update(hubId, fileUrn, versionNumber, elementId) {
      this.removeAllProperties();
      let respJSON = await this.getVersionElementProperties(hubId, fileUrn, elementId);
      let properVersion = respJSON.data.aecDesignsByHub.results.find(r => r.version.versionNumber == versionNumber);
      let cursor = properVersion.elements.results[0].properties.pagination.cursor;
      for (const property of properVersion.elements.results[0].properties.results) {
        this.addProperty(property.name, property.value, 'AEC DM Props');
      }
      while (!!cursor) {
        let newRespJSON = await getVersionElementPropertiesPaginated(hubId, fileUrn, elementId, cursor);
        properVersion = newRespJSON.data.aecDesignsByHub.results.find(r => r.version.versionNumber == versionNumber);
        cursor = properVersion.elements.results[0].properties.pagination.cursor;
        for (const property of properVersion.elements.results[0].properties.results) {
          this.addProperty(property.name, property.value, 'AEC DM Props');
        }
      }
  }

  async getVersionElementProperties(hubId, fileUrn, elementId) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query: `query GetPropertiesFromURN{
        aecDesignsByHub(hubId:"${hubId}", filter:{fileUrn:"${fileUrn}"}){
          results{
            version{
              versionNumber
            }
            elements(filter:{query:"'property.name.Element Context'==Instance and 'property.name.Revit Element ID'==${elementId}"}){
              results{
                properties{
                  pagination{
                    cursor
                  }
                  results{
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }`,
      variables: undefined,
      operationName: "GetPropertiesFromURN"
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token.access_token
      },
      body: JSON.stringify(jsonBody)
    };
    let timestarted = Date.now();
    let resp = await fetch(this.graphqlUrl, options);
    let timeElapsed = Date.now() - timestarted;
    console.log(`Query response received after ${timeElapsed} ms`);
    console.log(jsonBody.query);
    let respJSON = await resp.json();
    return respJSON;
  }
  
  async getVersionElementPropertiesPaginated(hubId, fileUrn, elementId, cursor) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query: `query GetPropertiesFromURN{
        aecDesignsByHub(hubId:"${hubId}", filter:{fileUrn:"${fileUrn}"}){
          results{
            version{
              versionNumber
            }
            elements(filter:{query:"'property.name.Element Context'==Instance and 'property.name.Revit Element ID'==${elementId}"}){
              results{
                properties(pagination:{cursor:"${cursor}"}){
                  pagination{
                    cursor
                  }
                  results{
                    name
                    value
                  }
                }
              }
            }
          }
        }
      }`,
      variables: undefined,
      operationName: "GetPropertiesFromURN"
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token.access_token
      },
      body: JSON.stringify(jsonBody)
    };
    let timestarted = Date.now();
    let resp = await fetch(this.graphqlUrl, options);
    let timeElapsed = Date.now() - timestarted;
    console.log(`Query response received after ${timeElapsed} ms`);
    console.log(jsonBody.query);
    let respJSON = await resp.json();
    return respJSON;
  }

  async 

  toDisplayUnits(value, units, precision) {
      return Autodesk.Viewing.Private.formatValueWithUnits(value, units, 3, precision);
  }
}