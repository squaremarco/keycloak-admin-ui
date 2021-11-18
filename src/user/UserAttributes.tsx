import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { pick, pipe, mapValues } from "lodash/fp";
import {
  ActionGroup,
  AlertVariant,
  Button,
  FormGroup,
  PageSection,
  PageSectionVariants,
  TextInput,
} from "@patternfly/react-core";

import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";

import { useAlerts } from "../components/alert/Alerts";
import type { AttributeForm } from "../components/attribute-form/AttributeForm";
import { useAdminClient } from "../context/auth/AdminClient";
import { FormAccess } from "../components/form-access/FormAccess";

type UserAttributesProps = {
  user: UserRepresentation;
};

const ATTRIBUTES = ["market", "submarket", "range", "brand"];

export const UserAttributes = ({ user }: UserAttributesProps) => {
  const { t } = useTranslation("users");
  const adminClient = useAdminClient();
  const { addAlert, addError } = useAlerts();

  const { handleSubmit, register, errors } = useForm({
    defaultValues: user.attributes
      ? mapValues((v: any) => v[0], user.attributes)
      : {},
  });

  const save = async (attributeForm: AttributeForm) => {
    try {
      const attributes = pipe(
        pick(ATTRIBUTES),
        mapValues((v) => [v])
      )(attributeForm!);
      await adminClient.users.update({ id: user.id! }, { ...user, attributes });

      addAlert(t("userSaved"), AlertVariant.success);
    } catch (error) {
      addError("groups:groupUpdateError", error);
    }
  };

  return (
    <PageSection variant={PageSectionVariants.light}>
      <FormAccess
        isHorizontal
        onSubmit={handleSubmit(save)}
        role="manage-realm"
        className="pf-u-mt-lg"
      >
        <FormGroup
          label={t("market")}
          fieldId="kc-market"
          isRequired
          validated={errors.market ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <TextInput
            ref={register()}
            type="text"
            id={`kc-market`}
            name="market"
          />
        </FormGroup>
        <FormGroup
          label={t("submarket")}
          fieldId="kc-submarket"
          isRequired
          validated={errors.submarket ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <TextInput
            ref={register()}
            type="text"
            id="kc-submarket"
            name="submarket"
          />
        </FormGroup>
        <FormGroup
          label={t("range")}
          fieldId={`kc-range`}
          isRequired
          validated={errors.range ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <TextInput
            ref={register()}
            type="text"
            id={`kc-range`}
            name="range"
          />
        </FormGroup>
        <FormGroup
          label={t("brand")}
          fieldId="kc-brand"
          isRequired
          validated={errors.brand ? "error" : "default"}
          helperTextInvalid={t("common:required")}
        >
          <TextInput ref={register()} type="text" id="kc-brand" name="brand" />
        </FormGroup>
        {/* TODO: capire perchè questo non va {ATTRIBUTES.forEach((attr) => {
          console.log(attr);

          return (
            <FormGroup
              label={t(attr)}
              fieldId={`kc-${attr}`}
              isRequired
              validated={errors[attr] ? "error" : "default"}
              helperTextInvalid={t("common:required")}
            >
              <TextInput
                ref={register()}
                type="text"
                id={`kc-${attr}`}
                name={attr}
              />
            </FormGroup>
          );
        })} */}
        <ActionGroup>
          <Button data-testid="save-attribute" variant="primary" type="submit">
            {t("common:save")}
          </Button>
        </ActionGroup>
      </FormAccess>
    </PageSection>
  );
};
