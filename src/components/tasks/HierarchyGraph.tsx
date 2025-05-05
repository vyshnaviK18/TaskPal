import React from 'react';
import { 
  Tree, TreeNode, TreeNodeDatum, 
  TreeLinkDatum, RawNodeDatum 
} from 'react-d3-tree';
import { Task } from '../../lib/supabase';
import Card from '../ui/Card';

interface HierarchyGraphProps {
  tasks: Task[];
}

const HierarchyGraph: React.FC<HierarchyGraphProps> = ({ tasks }) => {
  // Build hierarchical data structure for d3 tree
  const buildTreeData = (tasks: Task[]): RawNodeDatum => {
    // Create a map of tasks by id for quick lookup
    const taskMap = new Map<string, Task>();
    tasks.forEach((task) => {
      taskMap.set(task.id, task);
    });
    
    // Create a map to store children for each task
    const childrenMap = new Map<string | null, Task[]>();
    
    // Group tasks by parent_id
    tasks.forEach((task) => {
      const parentId = task.parent_id;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)?.push(task);
    });
    
    // Recursively build the tree
    const buildNode = (taskId: string | null): RawNodeDatum => {
      if (taskId === null) {
        // Root node
        return {
          name: "Tasks",
          children: (childrenMap.get(null) || []).map((childTask) => 
            buildNode(childTask.id)
          ),
        };
      }
      
      const task = taskMap.get(taskId);
      if (!task) {
        return { name: "Unknown Task" };
      }
      
      const children = childrenMap.get(taskId) || [];
      return {
        name: task.title,
        attributes: {
          priority: task.weight,
          completed: task.completed ? "Yes" : "No",
        },
        children: children.map((childTask) => buildNode(childTask.id)),
      };
    };
    
    return buildNode(null);
  };
  
  const treeData = buildTreeData(tasks);
  
  // Custom node renderer
  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => (
    <g>
      <circle 
        r={15} 
        fill={
          nodeDatum.name === "Tasks" 
            ? "#0ea5e9" 
            : nodeDatum.attributes?.completed === "Yes"
              ? "#22c55e"
              : "#f97316"
        }
        onClick={toggleNode}
      />
      <text 
        fill="white" 
        x="0" 
        y="5" 
        textAnchor="middle" 
        style={{ fontSize: '10px' }}
      >
        {nodeDatum.attributes?.priority || ""}
      </text>
      <text 
        fill="#333" 
        x="20" 
        y="5" 
        style={{ fontSize: '12px' }}
      >
        {nodeDatum.name}
      </text>
      {nodeDatum.attributes && (
        <text 
          fill="#777" 
          x="20" 
          y="20" 
          style={{ fontSize: '10px' }}
        >
          {nodeDatum.attributes.completed === "Yes" ? "✅" : "⏳"}
        </text>
      )}
    </g>
  );
  
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl font-bold mb-4">Task Hierarchy Visualization</h2>
      
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          Add tasks to visualize their hierarchy
        </p>
      ) : (
        <div className="hierarchy-graph" style={{ width: '100%', height: '400px' }}>
          <Tree
            data={treeData}
            orientation="vertical"
            translate={{ x: 250, y: 50 }}
            renderCustomNodeElement={renderCustomNode}
            separation={{ siblings: 1, nonSiblings: 1.5 }}
            zoomable={true}
            collapsible={true}
          />
        </div>
      )}
    </Card>
  );
};

export default HierarchyGraph;