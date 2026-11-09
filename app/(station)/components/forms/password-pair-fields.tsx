import PasswordInput from "./password-input";
import { accountFieldClassName } from "../../account/components/account-surface";

type PasswordPairErrors = Partial<Record<"password" | "confirmPassword", string>>;

const labelClassName = "font-gabarito text-sm font-bold text-voicesNext-cream";
const errorClassName = "font-asap text-sm text-voicesNext-orange";

/**
 * A "choose a password" field and a "confirm it" field. Both are required to
 * match (the action checks it); this only renders them, with their errors tied
 * to the inputs for assistive tech.
 */
export default function PasswordPairFields({
  errors,
  hint,
}: {
  errors?: PasswordPairErrors;
  hint?: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClassName}>
          Create a password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(errors?.password)}
          aria-describedby={errors?.password ? "password-error" : "password-hint"}
          className={accountFieldClassName}
        />
        {errors?.password ? (
          <p id="password-error" className={errorClassName}>
            {errors.password}
          </p>
        ) : (
          hint && (
            <p id="password-hint" className="font-asap text-xs text-voicesNext-cream/70">
              {hint}
            </p>
          )
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className={labelClassName}>
          Confirm your password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          aria-invalid={Boolean(errors?.confirmPassword)}
          aria-describedby={errors?.confirmPassword ? "confirm-password-error" : undefined}
          className={accountFieldClassName}
        />
        {errors?.confirmPassword && (
          <p id="confirm-password-error" className={errorClassName}>
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </>
  );
}
