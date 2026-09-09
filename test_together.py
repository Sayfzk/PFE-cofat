import subprocess

puml = """@startuml cas_utilisation_global
title Diagramme de cas d'utilisation global - Cofat Capacity Study

left to right direction
skinparam packageStyle rectangle
skinparam usecase {
    BackgroundColor white
    BorderColor black
}
skinparam actorStyle stick

together {
    actor "Acheteur\\n(Achat)" as Achat
    actor "Site Manager" as SM
    actor "Administrateur" as Admin
}

Achat -[hidden]down-> SM
SM -[hidden]down-> Admin

Admin -up-|> SM

usecase "S'authentifier" as UC_Auth
usecase "Modifier unitPrice\\net currency (budget)" as UC_EditBudget
usecase "Consulter le catalogue\\nStandard Investment" as UC_Catalog
usecase "Créer et soumettre\\nune demande de budget" as UC_Budget
usecase "Gérer la planification\\nlocale (Équip./Espaces/RH)" as UC_LocalPlan
usecase "Importer les\\nplanifications (Excel)" as UC_Import
usecase "Consulter la\\nconsolidation Groupe" as UC_Consolidation
usecase "Superviser le tableau\\nde bord Admin" as UC_AdminDash
usecase "Gérer les sites\\nindustriels" as UC_Sites

Achat -- UC_EditBudget
Achat -- UC_Catalog
SM -- UC_Catalog
SM -- UC_Budget
SM -- UC_LocalPlan
SM -- UC_Import
SM -- UC_Consolidation
Admin -- UC_AdminDash
Admin -- UC_Sites

UC_EditBudget ..> UC_Auth : <<include>>
UC_Catalog ..> UC_Auth : <<include>>
UC_Budget ..> UC_Auth : <<include>>
UC_LocalPlan ..> UC_Auth : <<include>>
UC_Import ..> UC_Auth : <<include>>
UC_Consolidation ..> UC_Auth : <<include>>
UC_AdminDash ..> UC_Auth : <<include>>
UC_Sites ..> UC_Auth : <<include>>

@enduml
"""

with open("test_together.puml", "w", encoding="utf-8") as f:
    f.write(puml)
subprocess.run(["java", "-jar", "plantuml.jar", "test_together.puml"])
