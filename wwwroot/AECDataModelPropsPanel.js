export class AECDataModelPropsPanelPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(extension, id, title) {
      super(extension.viewer.container, id, title);
      this.extension = extension;
      this.graphqlUrl = 'https://developer.api.autodesk.com/aec/graphql';
  }

  async update(hubName, projectName, fileUrn, elementId) {
      this.removeAllProperties();
      let respJSON = await this.getVersionElementProperties(hubName, projectName, fileUrn, elementId);
      let element = respJSON.data.hubs.results[0].projects.results[0].elementGroups.results[0].elements.results[0];
      let cursor = element.properties.pagination.cursor;
      for (const property of element.properties.results) {
        let units = property.definition.units?.name;
        let value = units ? property.displayValue + ' ' + units : property.displayValue;
        this.addProperty(property.name, value, 'AEC DM Properties');
      }
      for(const reference of element.references.results){
        for(const referenceProperty of reference.value.properties.results){
          let units = referenceProperty.definition.units?.name;
          let referenceValue = units ? referenceProperty.displayValue + ' ' + units : referenceProperty.displayValue;
          this.addProperty(referenceProperty.name, referenceValue, `AEC DM Reference Properties - ${reference.name}`);
        } 
      }
      while (!!cursor) {
        let newRespJSON = await getVersionElementPropertiesPaginated(hubName, projectName, fileUrn, elementId, cursor);
        let element = respJSON.data.hubs.results[0].projects.resutls[0].elementGroups.results[0].elements.results[0];
        cursor = element.properties.pagination.cursor;
        for (const property of element.properties.results) {
          let units = property.definition.units?.name;
          let value = units ? property.displayValue + ' ' + units : property.displayValue;
          this.addProperty(property.name, value, 'AEC DM Properties');
        }
      }
  }

  async getVersionElementProperties(hubName, projectName, fileUrn, elementId) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query:`query GetPropertiesFromURN{
        hubs(filter:{name:"${hubName}"}
        pagination:{limit:1}){
          results{
            projects(filter:{name:"${projectName}"}
            pagination:{limit:1}){
              results{
                elementGroups(filter:{fileUrn:"${fileUrn}"}
                pagination:{limit:1}){
                  results{
                    elements(filter:{query: "'property.name.Element Context'==Instance and 'property.name.Revit Element ID'==${elementId}"}
                    pagination:{limit:1}){
                      results{
                        properties{
                          pagination {
                            cursor
                          }
                          results {
                            name
                            displayValue
                            definition{
                              units{
                                name
                              }
                            }
                          }
                        }
                        references{
                          results{
                            name
                            displayValue
                            definition{
                              units{
                                name
                              }
                            }
                            value{
                              name
                              properties{
                                results{
                                  name
                                  displayValue
                                  definition{
                                    units{
                                      name
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
  
  async getVersionElementPropertiesPaginated(hubName, projectName, fileUrn, elementId, cursor) {
    let token = await (await fetch('/api/auth/token')).json();
    let jsonBody = {
      query:`query GetPropertiesFromURN{
        hubs(filter:{name:"${hubName}"}
        pagination:{limit:1}){
          results{
            projects(filter:{name:"${projectName}"}
            pagination:{limit:1}){
              results{
                elementGroups(filter:{fileUrn:"${fileUrn}"}
                pagination:{limit:1}){
                  results{
                    elements(filter:{query: "'property.name.Element Context'==Instance and 'property.name.Revit Element ID'==${elementId}"}
                    pagination:{limit:1}){
                      results{
                        properties(pagination:{cursor:"${cursor}"}){
                          pagination {
                            cursor
                          }
                          results {
                            name
                            displayValue
                            definition{
                              units{
                                name
                              }
                            }
                          }
                        }
                        references{
                          results{
                            name
                            displayValue
                            definition{
                              units{
                                name
                              }
                            }
                            value{
                              name
                              properties{
                                results{
                                  name
                                  displayValue
                                  definition{
                                    units{
                                      name
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