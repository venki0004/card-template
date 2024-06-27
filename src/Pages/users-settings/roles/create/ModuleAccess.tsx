import PropTypes from "prop-types";
import CustomCheckbox from "../../../../components/MuiCheckBox";
const ModulesAccess = ({
  params,
  handleRootChange,
  handleChildChange,
}: any) => {
  return (
    <div>
      {params?.list?.map((item: any) => (
        <div key={item?.id}>
          {
            <>
              <div className="flex gap-2 justify-between space-y-3">
                <div>
                  <p>
                    <CustomCheckbox
                      handleCheck={(e: any) => handleRootChange(e, item)}
                      isChecked={item?.is_checked}
                      color="text-yellow"
                      name={item?.name}
                      Label={item?.name}
                    />
                  </p>
                </div>
                {!item.children?.length ? (
                  <div className="flex gap-1">
                    <CustomCheckbox
                      handleCheck={(e: any) => handleRootChange(e, item)}
                      isChecked={item?.is_write}
                      color="text-yellow"
                      name="is_write"
                      Label="C"
                    />
                    <CustomCheckbox
                      handleCheck={(e: any) => handleRootChange(e, item)}
                      isChecked={item.is_read}
                      color="text-yellow"
                      name="is_read"
                      Label="R"
                    />
                    <CustomCheckbox
                      handleCheck={(e: any) => handleRootChange(e, item)}
                      isChecked={item?.is_update}
                      color="text-yellow"
                      name="is_update"
                      Label="U"
                    />
                    <CustomCheckbox
                      handleCheck={(e: any) => handleRootChange(e, item)}
                      isChecked={item?.is_delete}
                      color="text-yellow"
                      name="is_delete"
                      Label="D"
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div className="flex gap-1 flex-col pl-6 lg:border-l-2 md:border-l-2 lg:border-[#141C4C] md:border-[#141C4C] lg:ml-[11px] md:ml-[11px] my-2">
                {item?.children?.map((child: any) => (
                  <div key={child.id} className="mt-2 flex justify-between">
                    <CustomCheckbox
                      isChecked={child?.is_checked}
                      color="text-yellow"
                      name={child?.name}
                      handleCheck={(e: any) =>
                        handleChildChange(e, item, child)
                      }
                      Label={child?.name}
                    />
                    <div className="flex gap-1">
                      <CustomCheckbox
                        handleCheck={(e: any) =>
                          handleChildChange(e, item, child)
                        }
                        isChecked={child?.is_write}
                        color="text-yellow"
                        name="is_write"
                        Label="C"
                      />
                      <CustomCheckbox
                        handleCheck={(e: any) =>
                          handleChildChange(e, item, child)
                        }
                        isChecked={child.is_read}
                        color="text-yellow"
                        name="is_read"
                        Label="R"
                      />
                      <CustomCheckbox
                        handleCheck={(e: any) =>
                          handleChildChange(e, item, child)
                        }
                        isChecked={child?.is_update}
                        color="text-yellow"
                        name="is_update"
                        Label="U"
                      />
                      <CustomCheckbox
                        handleCheck={(e: any) =>
                          handleChildChange(e, item, child)
                        }
                        isChecked={child?.is_delete}
                        color="text-yellow"
                        name="is_delete"
                        Label="D"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          }
        </div>
      ))}
    </div>
  );
};

export default ModulesAccess;
ModulesAccess.propTypes = {
  params: PropTypes.object.isRequired,
  handleRootChange: PropTypes.func.isRequired,
  handleChildChange: PropTypes.func.isRequired,
};
