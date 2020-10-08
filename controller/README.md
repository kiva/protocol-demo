# Controller

This it the generic code that can be used in all controller implementations.
Currently we're following a module where the controller code forms the base of the app, and the implementation
code is loaded in via directory paths specified in env variables. In the near future we will probably flip this
model so that each implementation will contain it's own app setup code, and the generic code will be brought in
module by module using npm.
