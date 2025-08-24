import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import ExcelDataManagement from "./ExcelDataManagement";
import { Button } from "@/components/ui/button";

const AddressDialog = ({
  onDataSubmitted,
}: {
  onDataSubmitted: () => void;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Add Addresses
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[80%]">
        <ExcelDataManagement onDataSubmitted={onDataSubmitted} />
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;
