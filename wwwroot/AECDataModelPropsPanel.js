export class AECDataModelPropsPanelPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(extension, id, title) {
      super(extension.viewer.container, id, title);
      this.extension = extension;
      this.graphqlUrl = 'https://developer.api.autodesk.com/aecdatamodel/graphql';
  }

  async update(designId, versionNumber, externalId) {
      this.removeAllProperties();
      let respJSON = await this.getVersionElementsProperty(designOne, versionOne, filter)
      let cursor = respJSON.data.elementsByDesignAtVersion.pagination.cursor;
      for (const result of respJSON.data.elementsByDesignAtVersion.results) {
        
        result.properties.results[0]
        if (!chartDataOne[result.properties.results[0].value])
          chartDataOne[result.properties.results[0].value] = 0
        chartDataOne[result.properties.results[0].value]++;
        elementsFound++;
      }
      while (!!cursor) {
        let newRespJSON = await getVersionElementsPropertyPaginated(designOne, versionOne, filter, cursor)
        cursor = newRespJSON.data.elementsByDesignAtVersion.pagination.cursor;
        for (const result of newRespJSON.data.elementsByDesignAtVersion.results) {
          if (!chartDataOne[result.properties.results[0].value])
            chartDataOne[result.properties.results[0].value] = 0
          chartDataOne[result.properties.results[0].value]++;
          elementsFound++;
        }
        loadingDiv.lastChild.lastChild.lastChild.childNodes[5].innerHTML = `Loading Data: ${elementsFound} elements found`;
      }
      for (const propName of propNames) {
        // this.addProperty('Max', this.toDisplayUnits(max, units, precision), category);
      }
  }

  async getVersionElementsProperty(designId, versionNumber, filter) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query: `query getVersionElementsProperty {
        elementsByDesignAtVersion(designId: "${designId}", versionNumber:${parseFloat(versionNumber)}, filter:{query:"${filter}"}) {
          pagination{cursor}
          results{
            name
            properties{
              results{
                value
                name
              }
            }
          }
        }
      }`,
      variables: undefined,
      operationName: "getVersionElementsProperty"
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
    let resp = await fetch(graphql_url, options);
    let timeElapsed = Date.now() - timestarted;
    console.log(`Query response received after ${timeElapsed} ms`);
    console.log(jsonBody.query);
    let respJSON = await resp.json();
    return respJSON;
  }
  
  async getVersionElementsPropertyPaginated(designId, versionNumber, filter, cursor) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query: `query getDesignElementsProperty {
        elementsByDesignAtVersion(designId: "${designId}", versionNumber:${parseFloat(versionNumber)} filter:{query:"${filter}"}, pagination:{cursor:"${cursor}"}) {
          pagination{cursor}
          results{
            name
            properties{
              results{
                value
                name
              }
            }
          }
        }
      }`,
      variables: undefined,
      operationName: "getDesignElementsProperty"
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
    let resp = await fetch(graphql_url, options);
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