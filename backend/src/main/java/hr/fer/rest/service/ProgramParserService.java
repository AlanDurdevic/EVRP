package hr.fer.rest.service;

import hr.fer.evrp.operators.MyMathOp;
import io.jenetics.Genotype;
import io.jenetics.ext.util.Tree;
import io.jenetics.ext.util.TreeNode;
import io.jenetics.prog.ProgramChromosome;
import io.jenetics.prog.ProgramGene;
import io.jenetics.prog.op.*;
import io.jenetics.util.ISeq;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPMultiple.OPERATIONS;
import static hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPMultiple.TERMINALS;
import static io.jenetics.util.RandomRegistry.random;

/**
 * Parses a GP program string (produced by Jenetics during training)
 * back into a Genotype that can be evaluated against real problem data.
 **/
@Slf4j
@Service
public class ProgramParserService {

    private static final int MAXIMUM_DEPTH = 255;

    private static final Map<String, Op<Double>> OP_MAP =
            OPERATIONS.stream().collect(Collectors.toMap(op -> op.name().toLowerCase(), op -> op));

    private final List<Op<Double>> terminalList = new ArrayList<>();
    private final Map<String, Op<Double>> terminalMap = new HashMap<>();

    public ProgramParserService() {
		TERMINALS.stream()
			.filter(t -> !(t instanceof EphemeralConst))
			.forEach(this::addTerminal);

        // EphemeralConst for training — not added to map (has no name)
        terminalList.add(EphemeralConst.of(() -> ((double) random().nextInt(11)) / 10));
    }

    /**
     * Register a runtime placeholder variable.
     * index must match the position in Double[] arguments at evaluation time.
     * Safe to call multiple times for the same name (idempotent).
     */
    public void registerTerminal(String name, int index) {
        if (terminalMap.containsKey(name.toLowerCase())) return;
        Var<Double> var = Var.of(name, index);
        // insert before EphemeralConst (last element)
        terminalList.add(terminalList.size() - 1, var);
        terminalMap.put(name.toLowerCase(), var);
        log.debug("Registered terminal '{}' at index {}", name, index);
    }

    private void addTerminal(Op<Double> var) {
        terminalList.add(var);
        terminalMap.put(var.name().toLowerCase(), var);
    }

    /**
     * Parses a program string into a Jenetics Genotype.
     * Call after all terminals are registered.
     */
    public Genotype<ProgramGene<Double>> parse(String programText) {
        TreeNode<Op<Double>> tree = parseTree(programText.trim());
        ISeq<Op<Double>> terminals = ISeq.of(terminalList);
        ProgramChromosome<Double> chromosome =
                ProgramChromosome.of(tree, ch -> ch.root().size() <= MAXIMUM_DEPTH, OPERATIONS, terminals);
        return Genotype.of(chromosome);
    }

    /**
     * Iterative parser — avoids stack overflow on large/deep programs.
     * Builds a TreeNode<Op<Double>> from the program string.
     */
    private TreeNode<Op<Double>> parseTree(String text) {
        Deque<TreeNode<Op<Double>>> stack = new ArrayDeque<>();
        TreeNode<Op<Double>> root = null;
        int pos = 0;

        while (pos < text.length()) {
            char c = text.charAt(pos);

            // skip whitespace and commas
            if (Character.isWhitespace(c) || c == ',') {
                pos++;
                continue;
            }

            if (c == ')') {
                // node complete — pop and attach to parent
                pos++;
                TreeNode<Op<Double>> completed = stack.pop();
                if (stack.isEmpty()) {
                    root = completed;
                } else {
                    stack.peek().attach(completed);
                }
                continue;
            }

            // read token
            int start = pos;
            while (pos < text.length()) {
                char ch = text.charAt(pos);
                if (ch == '(' || ch == ')' || ch == ',' || Character.isWhitespace(ch)) break;
                pos++;
            }
            String token = text.substring(start, pos);

            // skip whitespace after token
            while (pos < text.length() && Character.isWhitespace(text.charAt(pos))) pos++;

            if (pos < text.length() && text.charAt(pos) == '(') {
                // operator — push, children will attach on ')'
                pos++; // consume '('
                Op<Double> op = OP_MAP.get(token.toLowerCase());
                if (op == null)
                    throw new IllegalArgumentException("Unknown operation: '" + token + "' at pos " + start);
                stack.push(TreeNode.of(op));
            } else {
                // terminal — resolve and attach immediately
                TreeNode<Op<Double>> leaf = resolveTerminal(token, start);
                if (stack.isEmpty()) {
                    root = leaf; // single-node program
                } else {
                    stack.peek().attach(leaf);
                }
            }
        }

        if (root == null) throw new IllegalArgumentException("Empty program text");
        return root;
    }

    private TreeNode<Op<Double>> resolveTerminal(String token, int pos) {
        Op<Double> terminal = terminalMap.get(token.toLowerCase());
        if (terminal != null) return TreeNode.of(terminal);

        try {
            double val = Double.parseDouble(token);
            return TreeNode.of(Const.of(val));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Unknown terminal: '" + token + "' at pos " + pos);
        }
    }

	public String toTreeString(Genotype<ProgramGene<Double>> genotype) {
		StringBuilder sb = new StringBuilder();
		printNode(genotype.gene(), sb, "", "");
		return sb.toString();
	}

	private void printNode(Tree<?, ?> node, StringBuilder sb, String prefix, String childPrefix) {
		sb.append(prefix).append(node.value()).append("\n");
		List<? extends Tree<?, ?>> children = node.childStream().toList();
		for (int i = 0; i < children.size(); i++) {
			if (i < children.size() - 1) {
				printNode(children.get(i), sb, childPrefix + "├── ", childPrefix + "│   ");
			} else {
				printNode(children.get(i), sb, childPrefix + "└── ", childPrefix + "    ");
			}
		}
	}
}
