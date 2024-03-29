"use client";
import React, { useEffect, useState } from "react";
import { keyDeleteCall } from "./networking";
import { StatusOnlineIcon, TrashIcon } from "@heroicons/react/outline";
import {
  Badge,
  Card,
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
  Icon,
} from "@tremor/react";
import ViewKeySpendReport from "./view_key_spend_report";

// Define the props type
interface ViewKeyTableProps {
  userID: string;
  accessToken: string;
  data: any[] | null;
  setData: React.Dispatch<React.SetStateAction<any[] | null>>;
}

const ViewKeyTable: React.FC<ViewKeyTableProps> = ({
  userID,
  accessToken,
  data,
  setData,
}) => {
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const handleDelete = async (token: string) => {
    if (data == null) {
      return;
    }

    // Set the key to delete and open the confirmation modal
    setKeyToDelete(token);
    localStorage.removeItem("userData" + userID);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (keyToDelete == null || data == null) {
      return;
    }

    try {
      await keyDeleteCall(accessToken, keyToDelete);
      // Successfully completed the deletion. Update the state to trigger a rerender.
      const filteredData = data.filter((item) => item.token !== keyToDelete);
      setData(filteredData);
    } catch (error) {
      console.error("Error deleting the key:", error);
      // Handle any error situations, such as displaying an error message to the user.
    }

    // Close the confirmation modal and reset the keyToDelete
    setIsDeleteModalOpen(false);
    setKeyToDelete(null);
  };

  const cancelDelete = () => {
    // Close the confirmation modal and reset the keyToDelete
    setIsDeleteModalOpen(false);
    setKeyToDelete(null);
  };

  if (data == null) {
    return;
  }
  console.log("RERENDER TRIGGERED");
  return (
    <div>
    <Title>API Keys</Title>
    <Card className="w-full mx-auto flex-auto overflow-y-auto max-h-[50vh] mb-4">
      <Table className="mt-5">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Key Alias</TableHeaderCell>
            <TableHeaderCell>Secret Key</TableHeaderCell>
            <TableHeaderCell>Spend (USD)</TableHeaderCell>
            <TableHeaderCell>Budget (USD)</TableHeaderCell>
            <TableHeaderCell>Spend Report</TableHeaderCell>
            <TableHeaderCell>Team</TableHeaderCell>
            <TableHeaderCell>Metadata</TableHeaderCell>
            <TableHeaderCell>Models</TableHeaderCell>
            <TableHeaderCell>TPM / RPM Limits</TableHeaderCell>
            <TableHeaderCell>Expires</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => {
            console.log(item);
            // skip item if item.team_id == "litellm-dashboard"
            if (item.team_id === "litellm-dashboard") {
              return null;
            }
            return (
              <TableRow key={item.token}>
                <TableCell style={{ maxWidth: "2px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  {item.key_alias != null ? (
                    <Text>{item.key_alias}</Text>
                  ) : (
                    <Text>Not Set</Text>
                  )}
                </TableCell>
                <TableCell style={{ maxWidth: "2px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  <Text>{item.key_name}</Text>
                </TableCell>
                <TableCell style={{ maxWidth: "2px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  <Text>
                    {(() => {
                      try {
                        return parseFloat(item.spend).toFixed(4);
                      } catch (error) {
                        return item.spend;
                      }
                    })()}
                  </Text>
                </TableCell>
                <TableCell style={{ maxWidth: "2px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  {item.max_budget != null ? (
                    <Text>{item.max_budget}</Text>
                  ) : (
                    <Text>Unlimited</Text>
                  )}
                </TableCell>
                <TableCell style={{ maxWidth: '2px' }}>
                  <ViewKeySpendReport
                    token={item.token}
                    accessToken={accessToken}
                    keySpend={item.spend}
                    keyBudget={item.max_budget}
                    keyName={item.key_name}
                  />
                </TableCell>
                <TableCell style={{ maxWidth: "4px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  <Text>{item.team_alias && item.team_alias != "None" ? item.team_alias : item.team_id}</Text>
                </TableCell>
                <TableCell style={{ maxWidth: "4px", whiteSpace: "pre-wrap", overflow: "hidden"  }}>
                  <Text>{JSON.stringify(item.metadata).slice(0, 400)}</Text>
                  
                </TableCell>

                <TableCell style={{ maxWidth: "8-x", whiteSpace: "pre-wrap", overflow: "hidden" }}>
                  {Array.isArray(item.models) ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {item.models.map((model: string, index: number) => (
                        <Badge key={index} size={"xs"} className="mb-1" color="blue">
                           {model.length > 30 ? `${model.slice(0, 30)}...` : model}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell style={{ maxWidth: "2px", overflowWrap: "break-word" }}>
                  <Text>
                    TPM: {item.tpm_limit ? item.tpm_limit : "Unlimited"}{" "}
                    <br></br> RPM:{" "}
                    {item.rpm_limit ? item.rpm_limit : "Unlimited"}
                  </Text>
                </TableCell>
                <TableCell style={{ maxWidth: "2px", wordWrap: "break-word" }}>
                  {item.expires != null ? (
                    <Text>{item.expires}</Text>
                  ) : (
                    <Text>Never</Text>
                  )}
                </TableCell>
                <TableCell style={{ maxWidth: "2px", wordWrap: "break-word" }}>
                  <Icon
                    onClick={() => handleDelete(item.token)}
                    icon={TrashIcon}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal Panel */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Confirmation Modal Content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Key
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this key ?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button onClick={confirmDelete} color="red" className="ml-2">
                  Delete
                </Button>
                <Button onClick={cancelDelete}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
    </div>
  );
};

export default ViewKeyTable;
