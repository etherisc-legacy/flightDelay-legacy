#!/bin/bash 
# 
#	Select migrations to be used.
#
# 
 
pushd migrations
rm * 

#
#	Comment/uncomment desired migrations:
#
ln -s ../migrations-available/1_initial_migration.js 1_initial_migration.js	
#ln -s ../migrations-available/301_deploy_Controller.js 301_deploy_Controller.js	
ln -s ../migrations-available/302_deploy_Other.js 302_deploy_Other.js	
#ln -s ../migrations-available/201_deploy_Controller.js 201_deploy_Controller.js	
#ln -s ../migrations-available/202_deploy_AccessControl.js 202_deploy_AccessControl.js	
#ln -s ../migrations-available/203_deploy_Database.js 203_deploy_Database.js	
#ln -s ../migrations-available/204_deploy_Ledger.js 204_deploy_Ledger.js	
#ln -s ../migrations-available/205_deploy_Payout.js 205_deploy_Payout.js	
#ln -s ../migrations-available/206_deploy_NewPolicy.js 206_deploy_NewPolicy.js	
#ln -s ../migrations-available/207_deploy_Underwrite.js 207_deploy_Underwrite.js	
#ln -s ../migrations-available/299_deploy_finish.js 299_deploy_finish.js	
#ln -s ../migrations-available/999_deploy_Test_Oraclize.js 999_deploy_Test_Oraclize.js	

#
#	List selected migrations
#
ls -alF --color=auto
popd