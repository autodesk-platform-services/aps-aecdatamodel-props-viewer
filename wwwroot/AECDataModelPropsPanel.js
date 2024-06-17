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
        let units = property.propertyDefinition.units;
        let value = units ? property.displayValue + ' ' + units : property.displayValue;
        this.addProperty(property.name, value, 'AEC DM Properties');
      }
      for(const reference of properVersion.elements.results[0].references.results){
        for(const referenceProperty of reference.value.properties.results){
          let units = referenceProperty.propertyDefinition.units;
          let referenceValue = units ? referenceProperty.displayValue + ' ' + units : referenceProperty.displayValue;
          this.addProperty(referenceProperty.name, referenceValue, `AEC DM Reference Properties - ${reference.name}`);
        } 
      }
      while (!!cursor) {
        let newRespJSON = await getVersionElementPropertiesPaginated(hubId, fileUrn, elementId, cursor);
        properVersion = newRespJSON.data.aecDesignsByHub.results.find(r => r.version.versionNumber == versionNumber);
        cursor = properVersion.elements.results[0].properties.pagination.cursor;
        for (const property of properVersion.elements.results[0].properties.results) {
          let units = property.propertyDefinition.units;
          let value = units ? property.displayValue + ' ' + units : property.displayValue;
          this.addProperty(property.name, value, 'AEC DM Properties');
        }
        // for(const reference of properVersion.elements.results[0].references.results){
        //   this.addProperty(reference.name, reference.displayValue, 'AEC DM Reference Properties');
        // }
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
                    displayValue
                    propertyDefinition{
                      units
                    }
                  }
                }
                references{
                  results{
                    name
                    displayValue
                    propertyDefinition{
                      units
                    }
                    value{
                      name
                      properties{
                        results{
                          name
                          displayValue
                          propertyDefinition{
                            units
                          }
                        }
                      }
                    }
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
                    displayValue
                    propertyDefinition{
                      units
                    }
                  }
                }
                references{
                  results{
                    name
                    displayValue
                    propertyDefinition{
                      units
                    }
                    value{
                      name
                      properties{
                        results{
                          name
                          displayValue
                          propertyDefinition{
                            units
                          }
                        }
                      }
                    }
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