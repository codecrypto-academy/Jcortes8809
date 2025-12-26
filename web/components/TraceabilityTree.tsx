"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Token } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Package, Factory, Sprout } from "lucide-react";
import { formatAddress } from "@/lib/utils";
import Link from "next/link";

interface TraceabilityNode {
  token: Token;
  children: TraceabilityNode[];
  amountUsed?: bigint;
}

interface TraceabilityTreeProps {
  tokenId: bigint;
}

export function TraceabilityTree({ tokenId }: TraceabilityTreeProps) {
  const { web3Service } = useWeb3();
  const { t } = useLanguage();
  const [tree, setTree] = useState<TraceabilityNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTraceabilityTree();
  }, [tokenId, web3Service]);

  const loadTraceabilityTree = async () => {
    if (!web3Service) return;

    try {
      setIsLoading(true);
      setError(null);
      const node = await buildTraceabilityNode(tokenId);
      setTree(node);
      // Expand all nodes by default
      const allIds = collectAllNodeIds(node);
      setExpandedNodes(new Set(allIds));
    } catch (err) {
      console.error("Error loading traceability tree:", err);
      setError(t("tokens.traceability.noTraceability"));
    } finally {
      setIsLoading(false);
    }
  };

  const buildTraceabilityNode = async (
    id: bigint,
    amountUsed?: bigint
  ): Promise<TraceabilityNode> => {
    if (!web3Service) throw new Error("Web3 service not available");

    const token = await web3Service.getToken(id);
    const children: TraceabilityNode[] = [];

    // Recursively load parent tokens (ingredients)
    if (token.parentIds && token.parentIds.length > 0) {
      for (let i = 0; i < token.parentIds.length; i++) {
        const parentId = token.parentIds[i];
        const parentAmount = token.parentAmounts[i];
        const childNode = await buildTraceabilityNode(parentId, parentAmount);
        children.push(childNode);
      }
    }

    return {
      token,
      children,
      amountUsed,
    };
  };

  const collectAllNodeIds = (node: TraceabilityNode): string[] => {
    const ids = [node.token.id.toString()];
    for (const child of node.children) {
      ids.push(...collectAllNodeIds(child));
    }
    return ids;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (tree) {
      const allIds = collectAllNodeIds(tree);
      setExpandedNodes(new Set(allIds));
    }
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !tree) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            {error || t("tokens.traceability.noTraceability")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("tokens.traceability.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("tokens.traceability.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              {t("tokens.traceability.expandAll")}
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              {t("tokens.traceability.collapseAll")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TraceabilityNodeComponent
          node={tree}
          level={0}
          isExpanded={expandedNodes.has(tree.token.id.toString())}
          onToggle={() => toggleNode(tree.token.id.toString())}
        />
      </CardContent>
    </Card>
  );
}

interface TraceabilityNodeComponentProps {
  node: TraceabilityNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
}

interface ExpandedNodeWrapperProps {
  node: TraceabilityNode;
  level: number;
}

function ExpandedNodeWrapper({ node, level }: ExpandedNodeWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <TraceabilityNodeComponent
      node={node}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
}

function TraceabilityNodeComponent({
  node,
  level,
  isExpanded,
  onToggle,
}: TraceabilityNodeComponentProps) {
  const { t } = useLanguage();
  const hasChildren = node.children.length > 0;

  // Determine icon and color based on level
  const getNodeInfo = () => {
    if (!hasChildren) {
      return {
        icon: <Sprout className="h-4 w-4" />,
        label: t("tokens.traceability.rawMaterials"),
        colorClass: "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
      };
    } else if (level === 0) {
      return {
        icon: <Package className="h-4 w-4" />,
        label: t("tokens.traceability.finalProduct"),
        colorClass: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
      };
    } else {
      return {
        icon: <Factory className="h-4 w-4" />,
        label: t("tokens.traceability.intermediateProducts"),
        colorClass: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
      };
    }
  };

  const nodeInfo = getNodeInfo();

  const indentClass = level === 0 ? "" : level === 1 ? "ml-6" : level === 2 ? "ml-12" : level === 3 ? "ml-[72px]" : "ml-24";

  return (
    <div className="space-y-2">
      {/* Node card */}
      <div
        className={`border-2 rounded-lg p-4 ${nodeInfo.colorClass} ${indentClass} transition-all`}
      >
        <div className="flex items-start gap-3">
          {/* Toggle button */}
          {hasChildren && (
            <button
              type="button"
              onClick={onToggle}
              className="flex-shrink-0 mt-1 hover:bg-black/10 dark:hover:bg-white/10 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Node content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {nodeInfo.icon}
                <Link
                  href={`/tokens/${node.token.id}`}
                  className="font-semibold hover:underline"
                >
                  {node.token.name}
                </Link>
              </div>
              <Badge variant="secondary" className="text-xs">
                {nodeInfo.label}
              </Badge>
            </div>

            {/* Token details */}
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t("tokens.traceability.producedBy")}:
                </span>
                <code className="text-xs bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded">
                  {formatAddress(node.token.creator)}
                </code>
              </div>

              {node.amountUsed !== undefined && (
                <div className="text-muted-foreground">
                  {t("tokens.traceability.usedAmount", {
                    amount: node.amountUsed.toString(),
                  })}
                </div>
              )}

              <div className="text-muted-foreground">
                {t("tokens.traceability.totalAmount", {
                  amount: node.token.totalSupply.toString(),
                })}
              </div>
            </div>

            {/* Ingredients count */}
            {hasChildren && (
              <div className="text-xs text-muted-foreground">
                {node.children.length === 1
                  ? t("tokens.ingredientCount", { count: node.children.length })
                  : t("tokens.ingredientCount_plural", {
                      count: node.children.length,
                    })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {node.children.map((child, index) => {
            const childId = child.token.id.toString();
            return (
              <ExpandedNodeWrapper
                key={childId}
                node={child}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
