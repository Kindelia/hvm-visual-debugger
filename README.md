# HVM Visual Debugger

HVM Visual Debugger is a program written to aid in visualization of HVM memory during parallel runtime executions. It features event-step functionality and memory profile for each event, aswell as a graph showing all links between the nodes.

## Usage

To use this program, first it is needed to switch to the `parallel_debug` branch of HVM (since this a dev tool for now). Then, it is needed to uncomment the last if check of `runtime.c` (where it checks that `log_size > LOG_FAIL_INDEX`). After that, compile your program to C.
```sh
hvm compile foo.hvm
clang -O2 foo.hvm -o foo -pthread
./foo
```
After running the compiled program, a file named `log.js` will be created inside the same directory. Just drag and drop it to the clone of this repository and run it with
```
npm -i -g http-server
cd path_to/hvm_visual_debugger/
http-server
```
And it is ready to go.

### Events

There are 5 main events that are tracked for this program:
- **Link**, represents a new link being written to a specific position
- **Move**, represents a thread's passage through the graph, checking for whether it can pattern match.
- **Lock**, represents a thread locking a node for synchronization purposes.
- **Open**, represents a thread unlocking a node.
- **Free**, which frees up a memory position on the graph.

### Links

Links are representations of graph nodes inside the memory, and are the main part of HVM internal structure. In order to figure out which nodes each location represents, it is necessary to look at it's parent; ie. the node that points to that location in memory.

For example, if we have the link `NUM 5` at position 2 and `NUM 6` at position 3, there is no way to know what these two consecutive numbers mean without the parents location. If we encounter some node `OP('+', 2)`, then we can know that the both position 2 in the array and position 3 **together** form the addition node (notice that only the position of the first link is given, and the other is implied by the link's type, in this case `OP`). It is useful to see the links' locations as indexes in a big array.

There are 12 link types:
- `OP(operation_code, loc)`, which encodes the operation code, and utilizes `loc` and `loc + 1` as it's arguments locations.
- `LAM(loc)`, which encodes a lambda, where the bound variable is located in `loc` and the body of the lambda is located in `loc + 1`.
- `APP(loc)`, which encodes an application of a lambda to an argument. The lambda is assumed to be at `loc` and the argument at `loc + 1`.
- `SUP(color, loc)`, which encodes a superposition of two variables with color `color` (used to track which variables are the same) located at `loc` and `loc + 1`.
- `CTR(constructor_id, loc)`, which encodes a constructor of id `constructor_id`. The information about the arity of it is extracted from the generated log itself, aswell as the name, and it is used to know how many variables each constructor owns.
- `FUN(function_id, loc)`, which encodes a function id and a location for the first argument. It's semantics are very similar to constructors, and the only practical difference is that functions generate rewrite rules.
- `ARG(loc)`, which encodes an argument to a lambda, a duplication or a superposition, that is used at `loc` position.
- `VAR(loc)`, which encodes the usage of a variable that was created at `loc` position. Whenever an `VAR(l)` is created at position `p`, the corresponding `ARG(p)` is created at position `l`.
- `ERA`, which encodes an erased variable that. It does not have any arguments.
- `DP0(color, loc), DP1(color, loc)`, which encodes a duplication node. Notice that this is the only case where there are two nodes pointing to the same `loc` in memory, and it is on purpose, since they are creating two references to the same expression. Also note that it does not have a body stored inside it (as in a scope), rather it's `loc` points to the first variable being duplicated, `loc + 1` points to the second duplicated variable and `loc + 2` points to the duplicated expression. This is exactly why all `dup`'s nodes "float" around in the global scope.
- `NUM(val)` which technically does not represent a node since all number are unboxed (inlined). Rather, all `NUM`'s represent the actual numerical value that is being stored in that position (instead of storing a pointer to a position). Because of this, they are always represented inside some other node (together with 0-arity constructors and functions).

And last but not least there is a virtual link that does not exist inside HVM structure called `ROOT`. This is because the root node of a program is not stored inside the program (ie. the thing that points to the 0th-index). It is just there to represent the end result of the program (which can be inlined sometimes).
