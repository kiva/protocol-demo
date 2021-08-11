# Working with Protocol using Aries

This is the top level repo that external developers can use to launch full implementations (eg demo) locally on their machines

### Pre-setup
You will need the following installed, the version numbers are just suggestions:  
git (2.24), docker (20.10), docker-compose (1.27), npm (6.14), nodejs (14.15), java (11)

For docker, we recommend increasing its allocated resources to:
- CPUs: 8
- Memory: 6 GB
- Swap: 2 GB
For docker [docs](https://docs.docker.com/docker-for-mac/)

### Notes
We will be referencing the following github repos several times.  Here's the links:  
[protocol-demo](https://github.com/kiva/protocol-demo)  
[aries-guardianship-agency](https://github.com/kiva/aries-guardianship-agency)  
[aries-key-guardian](https://github.com/kiva/aries-key-guardian.git)  
[guardian-bio-auth](https://github.com/kiva/guardian-bio-auth.git)  
[protocol-gateway](https://github.com/kiva/protocol-gateway.git)
[protocol-common](https://github.com/kiva/protocol-common.git) (optional)
[aries-controller](https://github.com/kiva/aries-controller) (optional)

## Scripted Setup
1. Create a `home directory`.  The idea here is that we want some top level folder on your machine that contains all our repos in one place
You can call this "protocol-all" if you like.  Unless, specified, always run commands from the `home directory`.

2. Inside `home directory`, clone all our repos using these commands (please note the commands assume you have ssl setup):
    ```
    git clone git@github.com:kiva/protocol-demo.git
    ./protocol-demo/scripts/get_code.sh
    ```

3. Run the following command, from the `home directory`, to populate some dummy env values into .env files
    ```
    ./protocol-demo/scripts/dummy_env.sh
    ```

4. Run the following command, from the `home directory`, to get npm installs for each repo
    ```
    ./protocol-demo/scripts/npm_setup.sh
    ```
    Note: if this is your first time you'll need to manually pull the latest bcgov image:
    ```
    docker pull bcgovimages/aries-cloudagent:py36-1.16-1_0.7.0
    ```
5. From the `home directory`, build all of the docker containers
    ```
    ./protocol-demo/scripts/simple_build.sh
    ```

## Running the code (simple demo)
The simple demo includes the minimum pieces to spin up agents and run through the issuing and verifying flows with them 
1. Now that all the various repos have been set up, go into the protocol-demo repo
   ```
   cd protocol-demo
   ```
2. Start up the stack (and runs setup scripts)
   ```
   ./scripts/simple_start.sh
   ```
3. Run tests
   ```
   npm run test
   ```
4. When down stop everything
   ```
   ./scripts/simple_stop.sh
   ```

## Running full stack demo
The full stack demo includes the guardianship system which includes auth methods like fingerprints to control agents
This requires some addition setup scripts
1. First you need ensure you have java installed on your machine and then you can run the setup scripts. From the `home directory` run
   ```
   ./protocol-demo/scripts/java_setup.sh
   ```
2. You then need to build the full services
   ```
   ./protocol-demo/scripts/full_build.sh
   ```
3. Now go into the protocol-demo repo
   ```
   cd protocol-demo
   ```
4. Start up the full stack (and runs setup scripts) - this may take awhile and a lot of computer resources
   ```
   ./scripts/full_start.sh
   ```
5. Run tests
   ```
   npm run test
   ```
6. When down stop everything
   ```
   ./scripts/full_stop.sh
   ```
