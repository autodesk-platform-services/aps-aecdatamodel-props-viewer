# AEC Data Model Properties Viewer

The sample is using the [AEC Data Model API](https://aps.autodesk.com/en/docs/aecdatamodel/v1/developers_guide/overview/) to retrieve individual elements properties and then adding those in a custom property panel in the Viewer. With that, we can quickly check the properties available for a specific element and even compare with the properties available with the Viewer context (generated from Model Derivative API).

## Demo: http://aps-hubs-browser-aecdatamodel.autodesk.io

## Setting up the app

- clone this repository or download
- restore the packages
- replace the variable values at appsettings.Development.json with your own

```json
{
  "APS_CLIENT_ID": "YOUR CLIENT ID",
  "APS_CLIENT_SECRET": "YOUR CLIENT SECRET",
  "APS_CALLBACK_URL": "http://localhost:8080/api/auth/callback"
}
```

**Make sure your APS app also uses the same callback url!**

- Provision your client id in your ACC hub.
- Follow the [Onboarding to AEC Data Model](https://aps.autodesk.com/en/docs/aecdatamodel/v1/developers_guide/onboarding/) instructions to activate your hub for AEC Data Model.

**Once active, your hub will start generating ElementGroups from Revit 2024+ designs uploaded**

## Running the app

As instructed in the console, you'll need to open a web browser and navigate to http://localhost:8080 in order to log into your Autodesk account

Once you logged in with your Autodesk account in the browser, you'll need to select one Revit version to render with Viewer.
The sample works in a way that, as soon as you select one element, it runs a query through AEC Data Model API to return this element's properties.

![workflow](./readme/workflow.gif)

The query used to retrieve the properties is based in the `Hub Name`, `Project Name`, `File URN` and `Element ID`.
It looks like the one below:

```js
query GetPropertiesFromURN{
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
}
```

---

## Tips & Tricks

1. **You need to be logged in order to use any feature in this sample.**

## Troubleshooting

1. **Can't see properties for selected element**: Check the console for details. It also works for designs that generated `ElementGroups`.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

João Martins [in/jpornelas](https://linkedin.com/in/jpornelas)
