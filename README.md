# Working with Protocol using Aries

This is the top level repo that external developers can use to launch full implementations (eg demo) locally on their machines

### Pre-setup
You will need git, docker, docker-compose, npm, nodejs and java installed on your machine.

For docker, we recommend increasing its allocated resources to:
- CPUs: 8
- Memory: 6 GB
- Swap: 2 GB

### Notes
We will be referencing the following github repos several times.  Here's the links:  
[protocol-demo](https://github.com/kiva/protocol-demo)  
[aries-guardianship-agency](https://github.com/kiva/aries-guardianship-agency)  
[aries-key-guardian](https://github.com/kiva/aries-key-guardian.git)  
[guardian-bio-auth](https://github.com/kiva/guardian-bio-auth.git)  
[protocol-gateway](https://github.com/kiva/protocol-gateway.git)
[protocol-common](https://github.com/kiva/protocol-common.git) (optional)  

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
    There are a few token values still needed which can be found here:  
    [google doc](https://docs.google.com/document/d/1zpRvDuEpnbBiPN5JGVvBDujBUgSufGiKAf2AZd3azP8)  

4. Run the following command, from the `home directory`, to get npm installs for each repo
    ```
    ./protocol-demo/scripts/npm_setup.sh
    ```
    Note: if this is your first time you'll need to manually pull the latest bcgov image:
    ```
    docker pull bcgovimages/aries-cloudagent:py36-1.15-0_0.5.2
    ```

5. From the `home directory`, build all of the docker containers
    ```
    ./protocol-demo/scripts/build.sh
    ```

## Running the code (simple demo)
1. Now that everything has been set up, go into the protocol-demo repo
   ```
   cd protocol-demo
   ```
2. Start up the stack (and runs setup scripts)
   ```
   ./scripts/simple_start.sh
   ```
3. Run tests
   ```
   cd integration_tests
   npm run test:simple
   ```
4. When down stop everything
   ```
   ./scripts/simple_stop.sh
   ```
