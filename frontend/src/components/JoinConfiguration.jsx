import React, { useEffect } from 'react';

const JoinConfiguration = ({ selectedTables, joinConditions, setJoinConditions }) => {
  // Generate examples based on the actual table names
  const generateExample = (index) => {
    if (selectedTables.length < index + 2) return '';
    const firstTable = selectedTables[0];
    const secondTable = selectedTables[index + 1];
    return `${firstTable}.id = ${secondTable}.${firstTable}_id`;
  };

  // Ensure we have the correct number of join conditions initialized
  useEffect(() => {
    // When we have exactly two tables but no join conditions
    if (selectedTables.length === 2 && (!joinConditions || joinConditions.length === 0)) {
      setJoinConditions(['']);
    }
    
    // If tables are removed, trim the join conditions array accordingly
    if (joinConditions && joinConditions.length > selectedTables.length - 1) {
      setJoinConditions(joinConditions.slice(0, selectedTables.length - 1));
    }
  }, [selectedTables, joinConditions, setJoinConditions]);

  const handleJoinConditionChange = (index, value) => {
    const newJoinConditions = [...joinConditions];
    newJoinConditions[index] = value;
    setJoinConditions(newJoinConditions);
  };

  const addJoinCondition = () => {
    setJoinConditions([...joinConditions, '']);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Specify the join conditions to connect the tables. For each pair of tables, provide a condition in the format:
        <code className="bg-gray-100 px-2 py-1 rounded ml-1">table1.column = table2.column</code>
      </p>
      
      {selectedTables.length > 1 && (
        <div className="space-y-3">
          {selectedTables.slice(1).map((table, index) => (
            <div key={index} className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Join condition for {selectedTables[0]} and {table}:
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={joinConditions[index] || ''}
                  onChange={(e) => handleJoinConditionChange(index, e.target.value)}
                  placeholder={`e.g., ${generateExample(index)}`}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {joinConditions.length < selectedTables.length - 1 && (
        <button
          type="button"
          onClick={addJoinCondition}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          Add Another Join Condition
        </button>
      )}
      
      <div className="p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Important:</span> Make sure to qualify column names with table names if they appear in multiple tables.
        </p>
      </div>
    </div>
  );
};

export default JoinConfiguration; 