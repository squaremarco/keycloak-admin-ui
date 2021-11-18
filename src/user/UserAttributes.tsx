import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { pick, pipe, mapValues } from "lodash/fp";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  FormSelect,
  FormSelectOption,
  PageSection,
  PageSectionVariants,
  TextInput,
} from "@patternfly/react-core";

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import { useAlerts } from "../components/alert/Alerts";
import type { AttributeForm } from "../components/attribute-form/AttributeForm";
import { useAdminClient } from "../context/auth/AdminClient";
import { FormAccess } from "../components/form-access/FormAccess";
import { MinusCircleIcon, PlusCircleIcon } from "@patternfly/react-icons";
import {
  TableComposable,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@patternfly/react-table";
import { isArray } from "lodash";

type UserAttributesProps = {
  user: UserRepresentation;
};

type Distributorship = {
  brand: string;
  salesOrganizationAndSoldTo: string;
  defaultShipTo: string;
};

type UserForm = {
  userType: "internal" | "dealer";
  distributorships: Distributorship[];
};

const ATTRIBUTES = ["userType", "distributorship"];

const DISTRIBUTORSHIP_COLUMNS: Array<
  "brand" | "salesOrganizationAndSoldTo" | "defaultShipTo"
> = ["brand", "salesOrganizationAndSoldTo", "defaultShipTo"];

const DISTRIBUTORSHIP_EMPTY_VALUE: Distributorship = {
  brand: "",
  salesOrganizationAndSoldTo: "",
  defaultShipTo: "",
};

export const UserAttributes = ({ user }: UserAttributesProps) => {
  const { t } = useTranslation("users");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const userTypeFormOptions = [
    {
      key: "user-type-placeholder",
      value: "",
      label: t("common:selectOne"),
      isPlaceholder: true,
    },
    { key: "user-type-dealer", value: "dealer", label: t("dealer") },
    { key: "user-type-internal", value: "internal", label: t("internal") },
  ];

  const { handleSubmit, control, register, errors } = useForm<UserForm>({
    defaultValues: user.attributes
      ? mapValues((v: any) => {
          try {
            return JSON.parse(v[0]);
          } catch {
            return v[0];
          }
        }, user.attributes)
      : {},
  });

  const { fields, append, remove } = useFieldArray<Distributorship>({
    control,
    name: "distributorship",
  });

  const save = async (attributeForm: AttributeForm) => {
    try {
      const attributes = pipe(
        pick(ATTRIBUTES),
        mapValues((v) => (isArray(v) ? [JSON.stringify(v)] : [v]))
      )(attributeForm!);

      await adminClient.users.update({ id: user.id! }, { ...user, attributes });

      addAlert(t("userSaved"), AlertVariant.success);
    } catch (error) {
      addError("groups:groupUpdateError", error);
    }
  };

  useEffect(() => {
    if (fields.length === 0) {
      append(DISTRIBUTORSHIP_EMPTY_VALUE);
    }
  }, [fields]);

  return (
    <PageSection variant={PageSectionVariants.light}>
      <FormAccess
        isHorizontal
        onSubmit={handleSubmit(save)}
        role="manage-realm"
        className="pf-u-mt-lg"
      >
        <FormGroup
          label={t("userType")}
          fieldId="kc-userType"
          validated={errors.userType ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <Controller
            name="userType"
            control={control}
            render={(field) => (
              <FormSelect
                {...field}
                id="kc-userType"
                name="userType"
                type="text"
              >
                {userTypeFormOptions.map(({ key, ...option }) => (
                  <FormSelectOption key={key} {...option} />
                ))}
              </FormSelect>
            )}
          />
        </FormGroup>
        <FormGroup
          label={t("distributiorships")}
          fieldId="kc-distributiorships"
          helperTextInvalid={t("common:required")}
        >
          <TableComposable
            className="kc-distributorship__table"
            aria-label="Distributorships values"
            variant="compact"
            borders={false}
          >
            <Thead>
              <Tr>
                {DISTRIBUTORSHIP_COLUMNS.map((column) => (
                  <Th id={column} key={column}>
                    {t(column)}
                  </Th>
                ))}
                <Th id="actions" key="actions">
                  {t("actions")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {fields.map((distributorship, rowIndex) => (
                <Tr key={distributorship.id} data-testid="distributorship-row">
                  {DISTRIBUTORSHIP_COLUMNS.map((column) => (
                    <Td
                      key={`${distributorship.id}-${column}`}
                      id={`text-input-${rowIndex}-${column}`}
                      dataLabel={t(column)}
                    >
                      <TextInput
                        name={`distributorship[${rowIndex}].${column}`}
                        ref={register()}
                        aria-label={`${column}-input`}
                        defaultValue={distributorship[column]}
                        validated={
                          errors.distributorships?.[rowIndex]?.[column]
                            ? "error"
                            : "default"
                        }
                        data-testid={`distributorship-${column}-input`}
                      />
                    </Td>
                  ))}
                  <Td
                    key="minus-button"
                    id={`kc-minus-button-${rowIndex}`}
                    dataLabel={t("actions")}
                  >
                    <Button
                      id={`minus-button-${rowIndex}`}
                      aria-label={`remove with value ${distributorship.brand}, ${distributorship.salesOrganizationAndSoldTo} and ${distributorship.defaultShipTo}`}
                      variant="link"
                      className="kc-distributorship__minus-icon"
                      onClick={() => remove(rowIndex)}
                    >
                      <MinusCircleIcon />
                    </Button>
                  </Td>
                </Tr>
              ))}
              <Tr>
                <Td>
                  <Button
                    aria-label={t("addDistributorshipText")}
                    id="plus-icon"
                    variant="link"
                    className="kc-distributorship__plus-icon"
                    onClick={() => append(DISTRIBUTORSHIP_EMPTY_VALUE)}
                    icon={<PlusCircleIcon />}
                    data-testid="distributorship-add-row"
                  >
                    {t("addDistributorshipText")}
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </TableComposable>
        </FormGroup>
        <ActionGroup>
          <Button data-testid="save-attribute" variant="primary" type="submit">
            {t("common:save")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
