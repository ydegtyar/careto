/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow JSX map callbacks with more than 10 lines',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
            minimum: 1,
            default: 10,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      exceedsMaxLines:
        'JSX map callback is {{lineCount}} lines long (max allowed is {{maxLines}}). Extract into a subcomponent.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const maxLines = options.max || 10;

    return {
      CallExpression(node) {
        // Check if the method call is .map(...)
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'map'
        ) {
          return;
        }

        const callback = node.arguments[0];
        if (!callback) return;

        // Ensure callback is an arrow function or function expression
        if (
          callback.type !== 'ArrowFunctionExpression' &&
          callback.type !== 'FunctionExpression'
        ) {
          return;
        }

        // Check if callback returns JSX (either direct expression or block returning JSX)
        let containsJsx = false;
        if (callback.body.type === 'JSXElement' || callback.body.type === 'JSXFragment') {
          containsJsx = true;
        } else if (callback.body.type === 'BlockStatement') {
          // Check if block contains any JSX element/fragment
          for (const stmt of callback.body.body) {
            if (
              stmt.type === 'ReturnStatement' &&
              stmt.argument &&
              (stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment')
            ) {
              containsJsx = true;
              break;
            }
          }
        }

        if (!containsJsx) return;

        // Calculate line count from start to end of callback body/expression
        const loc = callback.body.loc || callback.loc;
        if (!loc) return;

        const lineCount = loc.end.line - loc.start.line + 1;

        if (lineCount > maxLines) {
          context.report({
            node: callback,
            messageId: 'exceedsMaxLines',
            data: {
              lineCount: String(lineCount),
              maxLines: String(maxLines),
            },
          });
        }
      },
    };
  },
};
