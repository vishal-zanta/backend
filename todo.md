                                                                                                                                                                                                  
  ### 1. Database Models (src/modules/*/*.model.ts)                                                                                                                                               
                                                                                                                                                                                                  
  • subService.model.ts: Delete this file completely.                                                                                                                                             
  • service.model.ts: CRITICAL: You must migrate the business logic flags from SubService to Service. You'll need to add sla, slaType, geoTagged, and fieldVisit directly to the Service schema.  
  You also need to remove the virtual subservices population block.                                                                                                                               
  • grievance.model.ts: Change classification.subService to classification.service.                                                                                                               
  • slaConfig.model.ts: Change the reference field from subService to service.                                                                                                                    
  • officerTagging.model.ts: Change the array subServices: [ObjectId] to services: [ObjectId].                                                                                                    
                                                                                                                                                                                                  
  ### 2. Controllers (src/modules/*/*.controller.ts)                                                                                                                                              
                                                                                                                                                                                                  
  • service.controller.ts:                                                                                                                                                                        
      • Delete createSubService, updateSubService, and deleteSubService.                                                                                                                          
      • Update getServiceTree() to return a 2-level hierarchy (Department -> Service) instead of 3 levels.                                                                                        
  • grievance.controller.ts:                                                                                                                                                                      
      • Find and replace all instances of .populate("classification.subService") with .populate("classification.service").                                                                        
      • Update attachSlaToGrievance() to query SLA configs by service instead of subService.                                                                                                      
      • Update Admin Dashboard aggregations (change $group: { _id: "$classification.subService" } to group by classification.service).                                                            
      • Fix the search logic (currently, searching for grievances looks up the SubService name; it should look up the Service name instead).                                                      
      • Fix the uploadGeotaggedImages logic to check grievance.classification.service.geoTagged.                                                                                                  
  • slaConfig.controller.ts & officerTagging.controller.ts: Update the CRUD operations to query and filter by service instead of subService.                                                      
                                                                                                                                                                                                  
  ### 3. Background Cron Jobs (src/cronjobs/escalation.cron.ts)                                                                                                                                   
                                                                                                                                                                                                  
  • The automated SLA escalation script heavily relies on grouping grievances by subService. This entire file needs to be updated to populate and map using classification.service.               
                                                                                                                                                                                                  
  ### 4. Validations (src/modules/*/*.validation.ts)                                                                                                                                              
                                                                                                                                                                                                  
  • grievance.validation.ts: Change subService: mongoId to service: mongoId inside createGrievanceSchema.                                                                                         
  • slaConfig.validation.ts: Change validation to expect a service ID.                                                                                                                            
  • officerTagging.validation.ts: Change validation to expect a services array.                                                                                                                   
                                                                                                                                                                                                  
  ### 5. API Routes (src/modules/*/*.routes.ts)                                                                                                                                                   
                                                                                                                                                                                                  
  • service.routes.ts: Remove endpoints related to SubServices (e.g., POST /sub-services, PUT /sub-services/:id).                                                                                 
                                                                                                                                                                                                  
  ### 6. Seeding Scripts (src/scripts/seedData.ts)                                                                                                                                                
                                                       