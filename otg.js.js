      /* otg.js (under construction) by https://github.com/danielsedoff
      lets you write and run JavaScript on the go with some syntactic sugar */
      class otgjs {

        processAsPriorityToken(position, context) {
          let word = context[position];
          let upperCaseWord = word.toUpperCase();
          console.log("upperCaseWord", upperCaseWord);
          if (Object.keys(this.priorityTokens).includes(upperCaseWord)) {
            let fun = this.priorityTokens[upperCaseWord];
            if (fun instanceof Function) {
              context = fun(position, context);
              console.log("context", context);
            }
          }
          return context;
        }

        processAsToken(position, context) {
          let word = context[position];
          let upperCaseWord = word.toUpperCase();
          console.log("upperCaseWord", upperCaseWord);
          if (Object.keys(this.tokens).includes(upperCaseWord)) {
            let fun = this.tokens[upperCaseWord];
            if (fun instanceof Function) {
              context = fun(position, context);
              console.log("context", context);
            }
          }
          return context;
        }

        equalToken(a, b) {
          return a.trim().toUpperCase() === b.trim().toUpperCase();
        }

        lookaround(leftLazySearch, rightLazySearch, array, startPosition) {
          let leftBoundary = startPosition;
          let rightBoundary = startPosition;
          while (leftBoundary > -1) {
            if (equalToken(leftLazySearch, array[leftBoundary])) break;
            --leftBoundary;
          }
          while (rightBoundary < array.length) {
            if (equalToken(rightLazySearch, array[rightBoundary])) break;
            ++rightBoundary;
          }
          return {
            leftFind: leftBoundary,
            rightFind: rightBoundary,
          };
        }

        simpleReplacement(context, position, replacement) {
          context[position] = replacement;
          return context;
        }

        __otgjs__checkTimeoutLoop() {
            let elapsed = Date.now() - document.__otgjs__startedTime;
            if (elapsed > parseInt(document.getElementById("timeoutLoopTextbox").value)) throw new Error('Timeout was reached in a loop')
            return true
          }

        __otgjs__tag_function(elementType) {
            let newElement = document.createElement(elementType);
            let content = document.createTextNode("empty content");
            newElement.appendChild(content);
            const maindiv = document.getElementById("___main");
            maindiv.appendChild(newElement);
            return newElement;
        }

        MANDATORY_CODE = `document.__otgjs__startedTime = Date.now();` + 
          'function ' + this.__otgjs__checkTimeoutLoop.toString() + 
          'function ' + this.__otgjs__tag_function.toString();

        TRYCATCH = {
          TRY: `document.getElementById("___main").innerHTML = ""; try {`,
          CATCH: `} catch (e) { 
            document.getElementById(\"___main\").innerHTML = 
            (\"<p style='color:red; font-weight:bold;'>Exception triggered on line \" + e.lineNumber + \" column \" + e.columnNumber + 
            \"<br>stack info: \" + e.stack + \"<br>message: \" + e.message + \"<br>exception name: \" + e.name + \"<br>\"); }`,
        };

        priorityTokens = {
          LIT: function (position, context) {
            
            let tokens = new otgjs().tokens;
            let localPosition = position;
            ++localPosition;
            
            let literalContentArray = []
            while (context[localPosition] != tokens.ENDLINE) {
              let word = context[localPosition];
              if (word.trim() != '') literalContentArray.push(word);
              context.splice(localPosition, 1);
            }
            let newLiteral = literalContentArray.join(tokens.SPACE);
            // Change $x into ${x}
            debugger
            newLiteral = newLiteral.replace(/([^A-z0-9_\.\(\)]*)(\$)([A-z_][A-z0-9_\.\(\)]*)/ig, `$1$2{$3}`);
            newLiteral = tokens.QUOT + newLiteral + tokens.QUOT;
            context[position] = newLiteral;
            return context;
          },
        }

        tokens = {
          QUOT: "`",
          ENDLINE: "\n",
          SPACE: ' ',

          PRINTLN: (position, context) =>
            this.simpleReplacement(
              context,
              position,
              '; document.getElementById("___main").innerHTML += "<br/>" + '
            ),
          PRINT: (position, context) =>
            this.simpleReplacement(
              context,
              position,
              '; document.getElementById("___main").innerHTML += "" + '
            ),

          GETID:(position, context) =>
            this.simpleReplacement(context, position, "document.getElementById"),

          TAG:(position, context) =>
            this.simpleReplacement(context, position, "__otgjs__tag_function"),  

          BEGIN: (position, context) =>
            this.simpleReplacement(context, position, "{"),
          END: (position, context) =>
            this.simpleReplacement(context, position, "}"),
          FUN: (position, context) =>
            this.simpleReplacement(context, position, "function"),
          AND: (position, context) =>
            this.simpleReplacement(context, position, "&&"),
          OR: (position, context) =>
            this.simpleReplacement(context, position, "||"),
          GE: (position, context) =>
            this.simpleReplacement(context, position, ">="),
          LE: (position, context) =>
            this.simpleReplacement(context, position, "<="),
          LT: (position, context) =>
            this.simpleReplacement(context, position, "<"),
          GT: (position, context) =>
            this.simpleReplacement(context, position, ">"),
          EQ: (position, context) =>
            this.simpleReplacement(context, position, "=="),
          NEQ: (position, context) =>
            this.simpleReplacement(context, position, "!="),
          NOT: (position, context) =>
            this.simpleReplacement(context, position, "!"),
          IS: (position, context) =>
            this.simpleReplacement(context, position, "="),

          MUL: (position, context) =>
            this.simpleReplacement(context, position, "*"),
          DIV: (position, context) =>
            this.simpleReplacement(context, position, "/"),
          SUB: (position, context) =>
            this.simpleReplacement(context, position, "-"),
          ADD: (position, context) =>
            this.simpleReplacement(context, position, "+"),

          INC: (position, context) =>
            this.simpleReplacement(context, position, "++"),
          DEC: (position, context) =>
            this.simpleReplacement(context, position, "--"),

          OF: function (position, context) {
            let tokens = new otgjs().tokens;
            let nextEndline = context.indexOf(tokens.ENDLINE, position);
            let newContext = new otgjs().simpleReplacement(
              context,
              position,
              "("
            );
            newContext.splice(nextEndline, 0, ")");
            return newContext;
          },

          FOR: (position, context) => {
            context = this.simpleReplacement(context, position, "for");
            ++position;
            context.splice(position, 0, "(");
            while (position < context.length - 1) {
              ++position;
              let word = context[position].trim().toUpperCase();
              if (word === "{" || word === this.tokens.BEGIN) {
                context.splice(position, 0, ")");
                context.splice(position, 0, " && __otgjs__checkTimeoutLoop()");                
                return context;
              }
            }
            return context;
          },

          DO: (position, context) =>
            this.simpleReplacement(context, position, "throw new Error('DO-WHILE is not implemented. Please use WHILE.');"),

          WHILE: (position, context) => {
            context = this.simpleReplacement(context, position, "while");
            ++position;
            context.splice(position, 0, "(");
            while (position < context.length - 1) {
              ++position;
              let word = context[position].trim().toUpperCase();
              if (word === "{" || word === this.tokens.BEGIN) {
                context.splice(position, 0, ")");
                context.splice(position, 0, " && __otgjs__checkTimeoutLoop()");                
                return context;
              }
            }
            return context;
          },

          IF: (position, context) => {
            context = this.simpleReplacement(context, position, "if");
            ++position;
            context.splice(position, 0, "(");

            while (position < context.length - 1) {
              ++position;
              let word = context[position].trim().toUpperCase();
              if (word === "{" || word === this.tokens.BEGIN) {
                context.splice(position, 0, ")");
                return context;
              }
            }
            return context;
          },

          ELSE: (position, context) => {
            context = this.simpleReplacement(context, position, "}");
            ++position;
            context.splice(position, 0, "else");
            return context;
          },

          DIE: function (position, context) {
            context[position] =
              '; throw new Error("Stepped on keyword: DIE") ;';
            return context;
          },

          CLEAR: function (position, context) {
            context[position] =
              'document.getElementById("___main").innerHTML = "";';
            return context;
          },

          REM: function (position, context) {
            let tokens = new otgjs().tokens;
            for (let i = position; i < context.length; ++i) {
              if (context[i] == tokens.ENDLINE) break;
              context[i] = " ";
            }
            console.log("REM returned", context);
            return context;
          },
        };

        static __main() {
          /* Transform the code from the textbox and run it */
          let mainDiv = document.getElementById("___main");
          let codeValue = document.getElementById("___code").value;

          if(codeValue.trim().toUpperCase() === "LISTALL") {
            document.getElementById("___main").innerHTML = Object.keys(__otg.tokens)
            return
          }

          let __otg = new otgjs();
          let transformedCode = __otg.__transform(mainDiv, codeValue);
          document.getElementById("__transformedCode").innerHTML = transformedCode;

          // Add try+catch to catch errors without console
          transformedCode =
           __otg.MANDATORY_CODE +
            __otg.TRYCATCH.TRY + transformedCode + __otg.TRYCATCH.CATCH;

          // The final transformed code
          document.getElementById("__finalTransformedCode").innerHTML = transformedCode;

          let mainMethod = new Function("");
          try {
            mainMethod = new Function(transformedCode);
          } catch (e) {
            document.getElementById("___main").innerHTML =
              "<p style='color:red; font-weight:bold;'>Exception triggered on line " +
              e.lineNumber +
              " column " +
              e.columnNumber +
              "<br>stack info: " +
              e.stack +
              "<br>message: " +
              e.message +
              "<br>exception name: " +
              e.name +
              "<br>";
          }
          console.log("mainMethod", mainMethod);
          mainMethod();
        }

        __transform(mainDiv, codeValue) {
          console.log("maindiv", mainDiv);
          console.log("codeValue", codeValue);

          /* Expand the code from a shortened version to normal JS */
          let lines = codeValue
            .split(/\r?\n/)
            .join(" " + this.tokens.ENDLINE + " ");
          let words = lines.split(/\t| /);
          words.push(this.tokens.ENDLINE);
          console.log("words1", words);

          let position = words.length - 1;
          let wordLimit = -1;

          // Priority pass
          while (position > wordLimit) {
            words = this.processAsPriorityToken(position, words);
            console.log("words", words.join(" "));
            --position;
          }

          position = words.length - 1;
          wordLimit = -1;

          // Normal pass
          while (position > wordLimit) {
            words = this.processAsToken(position, words);
            console.log("words", words.join(" "));
            --position;
          }

          let result = words.join(" ");
          console.log("result", result);

          return result;
        }
      }